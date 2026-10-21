// Original, inspectable native HTML examples. These are not imported package builds.
export const examples = [
  {
    id: "button",
    title: "Button",
    category: "Actions",
    tags: ["button", "action", "loading", "feedback"],
    description: "An action, with just the right amount of emphasis.",
    markup:
      '<button class="button primary" data-demo-save>Save changes</button>',
    usage:
      "Use one primary action per decision. Keep secondary actions visually quieter.",
    behavior:
      "Click Save changes to see a brief pending state followed by a checkmark. This demonstration does not save remote data.",
  },
  {
    id: "slider",
    title: "Slider",
    category: "Forms",
    tags: ["slider", "range", "input", "volume"],
    description: "An input for selecting a value within a range.",
    markup:
      '<div class="slider-demo"><div class="row between"><label for="volume">Volume</label><output for="volume">50</output></div><input id="volume" type="range" min="0" max="100" value="50" aria-label="Volume"><div class="row between muted small"><span>0</span><span>100</span></div></div>',
    usage:
      "Use a slider when relative position matters more than an exact typed value. Always provide a visible value and an accessible label.",
    behavior:
      "Drag the thumb or use the arrow keys. Home and End move to the range boundaries. The output updates as you move.",
  },
  {
    id: "input",
    title: "Input",
    category: "Forms",
    tags: ["input", "form", "field", "search"],
    description: "A clear, comfortable place to put your thoughts.",
    markup:
      '<div class="field-demo"><label for="project-name">Project name</label><input id="project-name" placeholder="Your next great idea" maxlength="120"><p class="small muted">A name you can always change later.</p></div>',
    usage:
      "Keep labels visible. Placeholder text should offer an example, not replace a label.",
    behavior:
      "A native text field with keyboard focus, a 120-character limit, and helper text. The value remains local to this example.",
  },
  {
    id: "switch",
    title: "Switch",
    category: "Forms",
    tags: ["switch", "toggle", "settings", "checkbox"],
    description: "Turn a preference on or off in a single step.",
    markup:
      '<label class="switch-row"><span><strong>Focus mode</strong><span class="muted small">A little less distraction.</span></span><input type="checkbox" role="switch" class="switch" aria-label="Focus mode"></label>',
    usage:
      "Use switches for binary preferences. Keep the label stable in both states.",
    behavior:
      "Click or press Space to toggle. This example is isolated and does not change application preferences.",
  },
  {
    id: "tabs",
    title: "Tabs",
    category: "Navigation",
    tags: ["tabs", "navigation", "panel", "selected"],
    description: "Related views that share the same space.",
    markup:
      '<div class="tabs-demo"><div class="segmented" role="tablist" aria-label="Example views"><button role="tab" aria-selected="true" tabindex="0" data-demo-tab="overview">Overview</button><button role="tab" aria-selected="false" tabindex="-1" data-demo-tab="activity">Activity</button><button role="tab" aria-selected="false" tabindex="-1" data-demo-tab="settings">Settings</button></div><section role="tabpanel" tabindex="0"><h3>A place for the essentials.</h3><p class="muted">Everything you need, nothing you don’t.</p></section></div>',
    usage:
      "Group closely related views. Avoid using tabs for a sequence that must be completed in order.",
    behavior:
      "Click a tab, or use Left and Right arrows within the tab list. Home and End select the first and last view.",
  },
  {
    id: "accordion",
    title: "Accordion",
    category: "Disclosure",
    tags: ["accordion", "collapse", "expand", "details"],
    description: "A little less on screen. A little more when you need it.",
    markup:
      '<div class="accordion-demo"><details><summary>Is Arsenal local-first?</summary><p>Yes. Search runs on your computer. There are no paid model calls.</p></details><details><summary>Can I use the examples?</summary><p>The original examples in this repository are MIT licensed. External references retain their own licenses.</p></details><details><summary>Does received mean ready to use?</summary><p>No. A received package still needs implementation and review.</p></details></div>',
    usage:
      "Use progressive disclosure for secondary detail. Keep critical decisions visible outside an accordion.",
    behavior:
      "Each native disclosure opens independently and works with Enter or Space. Its expanded state is exposed to assistive technology.",
  },
  {
    id: "dialog",
    title: "Dialog",
    category: "Disclosure",
    tags: ["dialog", "modal", "popup", "confirmation"],
    description: "A focused moment for a decision worth making.",
    markup:
      '<button class="button outline" data-demo-dialog>Open dialog</button>',
    usage:
      "Reserve a modal for focused decisions. Keep the title explicit and offer an easy way back.",
    behavior:
      "Opens a native modal with a local project-name example. Escape and Cancel close it; focus returns to the opener. No project is created on a server.",
  },
  {
    id: "progress",
    title: "Progress",
    category: "Feedback",
    tags: ["progress", "loading", "checklist", "onboarding"],
    description: "Make the next step feel a little closer.",
    markup:
      '<div class="progress-demo"><div class="row between"><strong>Make it yours</strong><output>0 of 3</output></div><progress max="3" value="0" aria-label="Setup progress"></progress><label><input type="checkbox"> Find an interaction</label><label><input type="checkbox"> Try the live example</label><label><input type="checkbox"> Save your favorite</label></div>',
    usage:
      "Show progress when the number of steps is known. Pair the indicator with a readable count.",
    behavior:
      "Check each step to update the progress bar and count. This is an isolated example, not your actual onboarding status.",
  },
];
