import { startFlow } from './startFlow';
import { blogFlow } from './blogFlow.';
import { postFlow } from './postFlow';
import { commentFlow } from './commentFlow';
import { likeFlow } from './likeFlow';
import { banFlow } from './banFlow';

export type TestObjectType = {
  basic: string;
  accessToken: string;
  refreshToken: string;
  userID: string;
  blogID: string;
  postID: string;
};
describe('AppController (e2e)', () => {
  jest.setTimeout(30000);
  const testObject: TestObjectType = startFlow();
  banFlow(testObject);
  //blogFlow(testObject);
  //postFlow(testObject);
  //commentFlow(testObject);
  //likeFlow(testObject);
});
