import { add } from "../src/sum";

test("add", () => {
  expect(add(1, 2)).toEqual(3);
});
