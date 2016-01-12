import GitLabConnector from '../../lib/connector';
import {
  expect
}
from 'chai';
describe('default settings', () => {
  let connector;
  it('exposes defaultSettings method', () => {
    return expect(GitLabConnector.defaultSettings).to.exist;
  });
})
