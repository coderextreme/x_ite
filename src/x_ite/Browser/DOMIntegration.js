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
import SFNodeCache  from "../Fields/SFNodeCache.js";

class DOMIntegration
{
	constructor (browser)
	{
		this .browser      = browser;
		this .rootElements = new WeakSet ();

		this .canvasObserver = new MutationObserver (() =>
		{
			this .observeRoot (this .browser .getElement () .children ("X3D") [0]);
		});

		this .canvasObserver .observe (this .browser .getElement () [0], {
			childList: true,
		});

		this .observeRoot (this .browser .getElement () .children ("X3D") [0]);
	}

	async observeRoot (rootElement)
	{
		try
		{
			if (! rootElement)
				return;

			if (this .rootElements .has (rootElement))
				return;

			this .rootElements .add (rootElement);

			// Display splash screen.

			this .browser .setBrowserLoading (true);
         this .browser .addLoadCount (this);

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

			// Start observing, also catches inlined inlines.
			this .observer .observe (rootElement, {
				attributes: true,
				childList: true,
				characterData: false,
				subtree: true,
				attributeOldValue: true,
			});

			// Events
			this .addEventDispatchersAll (rootElement);

			// Add inline doms from initial scene.
			this .processInlineElements (rootElement);

			this .browser .removeLoadCount (this);
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

		// First need to look for Inline doms to add to dom.
		this .processInlineElements (element);

		// Do not add to scene if already parsed as child of inline,
		// although Scene does not have .x3d so should never happen?
		if ($.data (element, "node"))
		{
			if (element .nodeName === "Inline" || element .nodeName === "INLINE")
				this .processInlineElement (element); // Only add dom.

			return;
		}
		else if (element .nodeName === "Scene" || element .nodeName === "SCENE")
		{
			return;
		}

		const parentNode = element .parentNode;

		// First get correct execution context.
		let nodeScene = this .browser .currentScene ; // assume main Scene

		if (parentNode .parentNode .nodeName === "Inline" || parentNode .parentNode .nodeName === "INLINE")
		{
			nodeScene = $.data (parentNode .parentNode, "node") .getInternalScene ();
		}
		else if ($.data (parentNode, "node"))
		{
			// Use parent's scene if non-root, works for inline.
			nodeScene = $.data (parentNode, "node") .getExecutionContext ();
		}

		this .parser .pushExecutionContext (nodeScene);

		// then check if root node.
		if ($.data (parentNode, "node"))
		{
			const node = $.data (parentNode, "node");

			this .parser .pushParent (node);
			this .parser .childElement (element);
			this .parser .popParent ();
		}
		else
		{
			// Inline or main root node.
			this .parser .childElement (element);
		}

		this .parser .popExecutionContext ();

		// Now after creating nodes need to look again for Inline doms.
		this .processInlineElements (element);

		// Then attach event dispatchers.
		// if (element .matches (this .sensorSelector)) { this .addEventDispatchers (element); } // matches () not well supported

		this .addEventDispatchers (element);
		this .addEventDispatchersAll (element); // also for childnodes
	}

	processRemovedNode (element)
	{
		// Works also for root nodes, as it has to be, since scene .rootNodes is effectively a MFNode in x-ite.
		// Also removes ROUTE elements.

		const node = $.data (element, "node");

		if (! node)
			return;

		node .dispose ();

		if (element .nodeName === "ROUTE")
			$.data (element, "node", null);
	}

	processInlineElements (element)
	{
		if (element .nodeName === "Inline" || element .nodeName === "INLINE")
			this .processInlineElement (element);

		for (const inlineElement of element .querySelectorAll ("Inline"))
			this .processInlineElement (inlineElement);
	}

	processInlineElement (element)
	{
		const node = $.data (element, "node");

		if (! node)
			return;

		node ._loadState .addInterest ("appendInlineElement", this, element);
	}

	appendInlineElement (element)
	{
		const node = $.data (element, "node");

		// Remove all child nodes.

		while (element .firstChild)
			element .removeChild (element .lastChild);

		// Add scene as child node of Inline element.

		if (node .checkLoadState () === X3DConstants .COMPLETE_STATE)
		{
			const X3DElement = $.data (node .getInternalScene (), "X3D");

			if (X3DElement)
				element .appendChild (X3DElement .querySelector ("Scene"));
		}

		// Send loadState event.

		const event = new CustomEvent ("loadState", {
			detail: {
				node: SFNodeCache .get (node),
				loadState: node .checkLoadState (),
			}
		});

		element .dispatchEvent (event);

		// Attach dom event callbacks.

		this .addEventDispatchersAll (element);
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

		const event = new CustomEvent (field .getName (), {
			detail: {
				node: SFNodeCache .get (node),
				value: field .valueOf (),
			}
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
