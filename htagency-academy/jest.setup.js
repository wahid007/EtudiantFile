// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock hasPointerCapture for Radix UI components in JSDOM
if (typeof Element.prototype.hasPointerCapture === 'undefined') {
  Element.prototype.hasPointerCapture = () => false;
}
if (typeof Element.prototype.releasePointerCapture === 'undefined') {
  Element.prototype.releasePointerCapture = () => {};
}
if (typeof Element.prototype.setPointerCapture === 'undefined') {
  Element.prototype.setPointerCapture = () => {};
}

// Mock scrollIntoView for Radix UI components in JSDOM
if (typeof Element.prototype.scrollIntoView === 'undefined') {
  Element.prototype.scrollIntoView = jest.fn();
}
