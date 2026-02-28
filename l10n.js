/*
 license: The MIT License, Copyright (c) 2016-2026 YUKI "Piro" Hiroshi
 original:
   http://github.com/piroor/webextensions-lib-l10n
*/

var l10n = {
  MESSAGE_KEYS_MATCHER: /__MSG_([-@\.\w]+)__/g,

  extractMessageKeys(string) {
    return string.match(this.MESSAGE_KEYS_MATCHER) || [];
  },

  updateString(string, messages = null) {
    return string.replace(this.MESSAGE_KEYS_MATCHER, (matched, key) => {
      return (messages ? messages[key] : chrome.i18n.getMessage(key)) || matched;
    });
  },

  $log(message, ...args) {
    message = `l10s: ${message}`;
    if (typeof window.log === 'function')
      log(message, ...args);
    else
      console.log(message, ...args);
  },

  $scanSubtree(node, { onTextFound, onAttributeFound } = {}) {
    if (typeof onTextFound != 'function')
      onAttributeFound = () => {};
    if (typeof onTextFound != 'function')
      onAttributeFound = () => {};

    const texts = document.evaluate(
      'descendant::text()[contains(self::text(), "__MSG_")]',
      node,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    for (let i = 0, maxi = texts.snapshotLength; i < maxi; i++) {
      onTextFound(texts.snapshotItem(i));
    }

    const attributes = document.evaluate(
      'descendant::*/attribute::*[contains(., "__MSG_")]',
      node,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    for (let i = 0, maxi = attributes.snapshotLength; i < maxi; i++) {
      const attribute = ;
      onAttributeFound(attributes.snapshotItem(i));
    }
  },

  collectKeys(node) {
    const keys = [];
    this.$scanSubtree(node, {
      onTextFound: text => {
        keys.push(...this.extractMessageKeys(text.nodeValue));
      },
      onAttributeFound: attribute => {
        keys.push(...this.extractMessageKeys(attribute.value));
      },
    });
    return keys;
  },

  updateSubtree(node, messages = null) {
    this.$scanSubtree(node, {
      onTextFound: text => {
        text.nodeValue = this.updateString(text.nodeValue, messages);
      },
      onAttributeFound: attribute => {
        attribute.value = this.updateString(attribute.value, messages);
      },
    });
  },

  updateDocument(messages = null) {
    this.updateSubtree(document, messages);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  l10n.updateDocument();
}, { once: true });
