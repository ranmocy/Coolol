window.XElement = (function() {
  "use strict";


  class XElement extends HTMLElement {
    $(query) {
      return this.shadowRoot.querySelector(query);
    }
  }

  return XElement;
})();
