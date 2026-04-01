import { faker } from '@faker-js/faker';

export interface TestCasePayload {
  title:          string;
  description?:   string;
  expectedResult: string;
  steps:          string[];
  automated?:     boolean;
}

export function buildTestCase(overrides: Partial<TestCasePayload> = {}): TestCasePayload {
  return {
    title:          faker.lorem.words(4),
    expectedResult: faker.lorem.sentence(),
    steps:          [faker.lorem.sentence()],
    automated:      false,
    ...overrides,
  };
}

export const orderedStepsPayload: TestCasePayload = {
  title:          'Order verification test case',
  expectedResult: 'All steps appear in correct sequence',
  steps:          ['Step A — first action', 'Step B — second action', 'Step C — third action'],
};
