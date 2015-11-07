window.XElement = (function() {
  "use strict";


  class XElement extends HTMLElement {
    $(name) {
      return this.shadowRoot.querySelector(`#${name}`);
    }
  }

  return XElement;
})();
