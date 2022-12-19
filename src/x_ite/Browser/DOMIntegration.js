/*******************************************************************************
 * MIT License
 *
 * Copyright (c) 2016 Andreas Plesch
 * taken from https://github.com/andreasplesch/x_ite_dom.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 ******************************************************************************/

import XMLParser    from "../Parser/XMLParser.js"
import X3DConstants from "../Base/X3DConstants.js";

class DOMIntegration
{
	constructor (browser)
	{
		this .browser     = browser;
		this .rootElement = undefined;

		this .canvasObserver = new MutationObserver (() =>
		{
			this .observeRoot (this .browser .getElement () .children ("X3D") [0]);
		});

		this .canvasObserver .observe (this .browser .getElement () [0], {
			childList: true,
		});

		const rootElement = this .browser .getElement () .children ("X3D") [0];

		if (rootElement)
			this .observeRoot (rootElement);
	}

	async observeRoot (rootElement)
	{
		try
		{
			if (rootElement === this .rootElement)
				return;

			this .rootElement = rootElement;

			if (rootElement)
			{
				// Display splash screen.

				this .browser .setBrowserLoading (true);
				this .browser .addLoadingObject (this);

				// Preprocess script nodes if not xhtml.

				if (! location .pathname .toLowerCase () .endsWith (".xhtml"))
					this .preprocessScriptElements (rootElement);

				// Now also attached x3d property to each node element.

				const importedScene = await this .browser .importDocument (rootElement, true);

				this .browser .replaceWorld (importedScene);

				this .parser = new XMLParser (importedScene);

				// Create an observer instance.

				this .observer = new MutationObserver (mutations =>
				{
					for (const mutation of mutations)
						this .processMutation (mutation);
				});

				// Start observing, also catches inlined Inline elements.

				this .observer .observe (rootElement, {
					attributes: true,
					childList: true,
					characterData: false,
					subtree: true,
					attributeOldValue: true,
				});

				// Add Inline elements from initial scene, and connect to node events.

				this .processInlineElements (rootElement);
				this .addEventDispatchersAll (rootElement);

				this .browser .removeLoadingObject (this);
			}
			else
			{
				this .browser .replaceWorld (null);
			}
		}
		catch (error)
		{
			console .error ("Error importing document:", error);
		}
	}

	preprocessScriptElements (rootElement)
	{
		const scriptElements = rootElement .querySelectorAll ("Script");

		for (const scriptElement of scriptElements)
			this .appendScriptElementChildren (scriptElement);
	}

	appendScriptElementChildren (scriptElement)
	{
		const
			domParser   = new DOMParser (),
			scriptDoc   = domParser .parseFromString (scriptElement .outerHTML, "application/xml"),
			scriptNodes = scriptDoc .children [0] .childNodes;

		scriptElement .textContent = "// Content moved into childNodes.";

		for (const scriptNode of scriptNodes)
			scriptElement .appendChild (scriptNode);
	}

	processMutation (mutation)
	{
		switch (mutation .type)
		{
			case "attributes":
			{
				this .processAttribute (mutation, mutation .target);
				break;
			}
			case "childList":
			{
				for (const node of mutation .addedNodes)
					this .processAddedNode (node);

				for (const node of mutation .removedNodes)
					this .processRemovedNode (node);

				break;
			}
		}
	}

	processAttribute (mutation, element)
	{
		if ($.data (element, "node"))
		{
			const
				attributeName = mutation .attributeName,
				attribute     = element .attributes .getNamedItem (attributeName);

			this .parser .nodeAttribute (attribute, $.data (element, "node"));
		}
		else
		{
			// Is an attribute of non-node child such as fieldValue (or ROUTE).

			const
				parentNode = element .parentNode,
			 	node       = $.data (parentNode, "node");

			this .parser .pushExecutionContext (node .getExecutionContext ());
			this .parser .pushParent (node);
			this .parser .childElement (element);
			this .parser .popParent ();
			this .parser .popExecutionContext ();
		}
	}

	processAddedNode (element)
	{
		// Only process element nodes.

		if (element .nodeType !== Node .ELEMENT_NODE)
			return;

		if (element .nodeName === "X3D")
			return;

		if ($.data (element, "node"))
			return;

		const
			parentNode = element .parentNode,
			parser     = this .parser;

		if (parentNode .nodeName .match (/^(?:Scene|SCENE)$/))
		{
			// Root scene or Inline scene.

			const scene = $.data (parentNode, "node");

			parser .pushExecutionContext (scene);
			parser .childElement (element);
			parser .popExecutionContext ();
		}
		else if ($.data (parentNode, "node"))
		{
			// Use parent's scene if non-root, works for Inline.

			const
				node             = $.data (parentNode, "node"),
				executionContext = node .getExecutionContext ();

			parser .pushExecutionContext (executionContext);
			parser .pushParent (node);
			parser .childElement (element);
			parser .popParent ();
			parser .popExecutionContext ();
		}
		else
		{
			const scene = this .browser .currentScene;

			parser .pushExecutionContext (scene);
			parser .childElement (element);
			parser .popExecutionContext ();
		}

		// Now after creating nodes need to look again for Inline elements.

		this .processInlineElements (element);

		// Then attach event dispatchers.

		this .addEventDispatchers (element);
		this .addEventDispatchersAll (element);
	}

	processRemovedNode (element)
	{
		// Works also for root nodes, as it has to be, since scene .rootNodes is effectively a MFNode in x-ite.
		// Also removes ROUTE elements.

		const node = $.data (element, "node");

		if (! node)
			return;

		node .dispose ();

		$.data (element, "node", null);
	}

	processInlineElements (element)
	{
		if (element .nodeName .match (/^(?:Inline|INLINE)$/))
			this .processInlineElement (element);

		for (const inlineElement of element .querySelectorAll ("Inline"))
			this .processInlineElement (inlineElement);
	}

	processInlineElement (element)
	{
		const node = $.data (element, "node");

		if (! node)
			return;

		node ._loadState .addInterest ("appendInlineChildElement", this, element);
	}

	appendInlineChildElement (element)
	{
		const node = $.data (element, "node");

		switch (node .checkLoadState ())
		{
			case X3DConstants .NOT_STARTED_STATE:
			case X3DConstants .FAILED_STATE:
			{
				// Remove all child nodes.

				while (element .firstChild)
					element .removeChild (element .lastChild);

				break;
			}
			case X3DConstants .COMPLETE_STATE:
			{
				// Remove all child nodes.

				while (element .firstChild)
					element .removeChild (element .lastChild);

				// Add scene as child node of Inline element.

				const X3DElement = $.data (node .getInternalScene (), "X3D");

				if (X3DElement)
					element .appendChild (X3DElement);

				// Add Inline elements, and connect to node events.

				this .processInlineElements (element);
				this .addEventDispatchersAll (element);

				break;
			}
		}

		switch (node .checkLoadState ())
		{
			case X3DConstants .COMPLETE_STATE:
			{
				const event = new CustomEvent ("load",
				{
					detail: { node: node .valueOf () },
				});

				element .dispatchEvent (event);
				break;
			}
			case X3DConstants .FAILED_STATE:
			{
				const event = new CustomEvent ("error",
				{
					detail: { node: node .valueOf () },
				});

				element .dispatchEvent (event);
				break;
			}
		}
	}

	addEventDispatchersAll (element)
	{
		const childElements = element .querySelectorAll ("*");

		for (const childElement of childElements)
			this .addEventDispatchers (childElement);
	}

	addEventDispatchers (element)
	{
		// Check for USE nodes; they do not emit events.

		if (element .nodeName === "ROUTE")
			return;

		const node = $.data (element, "node");

		if (! node)
			return;

		for (const field of node .getFields ())
			this .bindFieldCallback (field, element);
	}

	bindFieldCallback (field, element)
	{
		if (! field .isOutput ())
			return;

		field .addInterest ("fieldCallback", this, element);

		if (this .trace)
			field .addInterest ("fieldTraceCallback", this, element);
	}

	fieldCallback (element, field)
	{
		const node = $.data (element, "node");

		if (! node)
			return;

		const event = new CustomEvent (field .getName (),
		{
			detail: {
				node: node .valueOf (),
				value: field .valueOf (),
			},
		});

		element .dispatchEvent (event);
	}

	fieldTraceCallback (element, field)
	{
		const
			now       = Date .now (),
			timeStamp = node .getBrowser () .getCurrentTime (),
			dt        = now - timeStamp * 1000,
			node      = $.data (element, "node");

		console .log ("%f: at %f dt of %s ms %s '%s' %s: %s",
					     now, timeStamp, dt .toFixed (3),
					     node .getTypeName (), node .getName (),
					     field .getName (), field .valueOf ());
	}
};

export default DOMIntegration;
