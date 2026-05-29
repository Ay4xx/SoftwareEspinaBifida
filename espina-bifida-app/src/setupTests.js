// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Global mocks for modules that cause browser-only behavior during imports
jest.mock('html-to-image', () => ({
	toPng: jest.fn(() => Promise.resolve('data:image/png;base64,MOCK')),
	toJpeg: jest.fn(() => Promise.resolve('data:image/jpeg;base64,MOCK')),
}));

jest.mock('jspdf', () => {
	return jest.fn().mockImplementation(() => ({
		addImage: jest.fn(),
		save: jest.fn(),
		setFontSize: jest.fn(),
	}));
});