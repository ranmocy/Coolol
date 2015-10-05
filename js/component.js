import $ from 'js/utils.js';

export default class Component extends HTMLElement {

  // Hyphenated name for component MyCumstomizedElement is 'my-customized-element'.
  static get hyphenatedName() {
    let className = this.name;
    let upperCaseWordsRegex = /([A-Z][^A-Z]+)/g;
    let words = [];
    let match = upperCaseWordsRegex.exec( className );
    while ( match ) {
      words.push( match[1].toLowerCase() );
      match = upperCaseWordsRegex.exec( className );
    }
    return words.join( "-" );
  }

  // Tag name for component MyCumstomizedElement is 'x-my-customized-element'.
  static get elementName() {
    return `x-${this.hyphenatedName}`;
  }

  static get templatePath() {
    return `template/${this.hyphenatedName}.html`;
  }

  static register() {
    document.registerElement(this.elementName, this);
  }

  // attachedCallback() { }
  // detachedCallback() { }
  // attributeChangedCallback(attr, oldVal, newVal) {}

  createdCallback() {
    this.textContent = "I'm hacked!";

    this.promise = $.get(this.templatePath)
      .then((html) => {
        console.log(`Get template: ${html}`);
        this.template_html = html;
        this.el = document.createElement('div');
        this.el.innerHTML = this.template_html;
      });
  }

  attach(root) {
    this.promise.then(() => {
      var shadowRoot = root.createShadowRoot();
      shadowRoot.appendChild(this.el);
    });
  }
}
