$("table.examples a") .on ("click", function ()
{
   let
      div      = $("div.example"),
      header   = div .find (".header"),
      toolbar  = div .find (".toolbar"),
      canvas   = div .find ("x3d-canvas"),
      zip      = div .find ("zip");

   if (div .length)
   {
      canvas .prop ("browser") .beginUpdate ();
      div .show ();
   }
   else
   {
      div     = $("<div></div>") .addClass ("example") .appendTo ("body");
      header  = $("<p></p>") .addClass ("header") .appendTo (div);
      toolbar = $("<p></p>") .addClass ("toolbar") .appendTo (div);
      canvas  = $("<x3d-canvas></x3d-canvas>") .appendTo (div);

      $("<i></i>") .addClass (["fas", "fa-solid", "fa-circle-xmark", "fa-fw"]) .appendTo (div) .on ("click", function ()
      {
         canvas .prop ("browser") .endUpdate ();
         div .hide ();
      });

      zip = $("<a></a>") .addClass ("zip") .text ("Download ZIP Archive") .appendTo ($("<p></p>") .appendTo (div));
   }

   header .text ($(this) .attr ("title"));
   canvas .attr ("src", $(this) .attr ("href"));
   zip    .attr ("href", $(this) .attr ("href") .replace (/\.x3d$/, ".zip"));

   updateToolbar (toolbar, canvas)

   console .log (`Loading ${$(this) .attr ("title")} ...`);

   return false;
});

function updateToolbar (toolbar, canvas)
{
   const browser = canvas .prop ("browser");

   toolbar .empty ();

   const antialiased = $("<span></span>")
      .text ("antialiased")
      .attr ("title", "Toggle antialiasing.")
      .addClass ("selected")
      .on ("click", () =>
      {
         const value = !browser .getBrowserOption ("Antialiased");

         browser .setBrowserOption ("Antialiased", value);

         antialiased .toggleClass ("selected");
      })
      .appendTo (toolbar);

   $("<span></span>") .addClass ("dot") .appendTo (toolbar);

   const contentScale = $("<span></span>")
      .text ("contentScale 1.0")
      .attr ("title", "Toggle contentScale between 0.1, 1.0 and 2.0.")
      .on ("click", () =>
      {
         const
            index = ((contentScale .attr ("index") ?? 1) + 1) % 3,
            value = [0.1, 1, 2][index];

         browser .setBrowserOption ("ContentScale", value);

         contentScale
            .attr ("index", index)
            .text ("contentScale " + value .toFixed (1))
      })
      .appendTo (toolbar);

   $("<span></span>") .addClass ("dot") .appendTo (toolbar);

   const pixelated = $("<span></span>")
      .text ("pixelated")
      .attr ("title", "Set CSS property image-rendering to pixelated.")
      .on ("click", () =>
      {
         canvas .css ("image-rendering", pixelated .hasClass ("selected") ? "unset" : "pixelated");

         pixelated .toggleClass ("selected");
      })
      .appendTo (toolbar);

   $("<span></span>") .addClass ("separator") .appendTo (toolbar);

   const oit = $("<span></span>")
      .text ("oit")
      .attr ("title", "Toggle order independent transparency.")
      .on ("click", () =>
      {
         const value = !browser .getBrowserOption ("OrderIndependentTransparency");

         browser .setBrowserOption ("OrderIndependentTransparency", value);

         oit .toggleClass ("selected");
      })
      .appendTo (toolbar);

   $("<span></span>") .addClass ("dot") .appendTo (toolbar);

   const log = $("<span></span>")
      .text ("log")
      .attr ("title", "Toggle logarithmic depth buffer.")
      .on ("click", () =>
      {
         const value = !browser .getBrowserOption ("LogarithmicDepthBuffer");

         browser .setBrowserOption ("LogarithmicDepthBuffer", value);

         log .toggleClass ("selected");
      })
      .appendTo (toolbar);
}
