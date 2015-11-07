window.Element = (function() {
  "use strict";

  class Element extends HTMLElement {
    $(name) {
      return this.shadowRoot.querySelector(`#${name}`);
    }
  }

  return Element;
})();
