import { Octokit } from "@octokit/rest"
import { readFileSync } from "fs"
import { join } from "path"
import { WebhookPayloadPullRequest, WebhookPayloadIssues, WebhookPayloadIssueComment } from "@octokit/webhooks"

/**
 * Creates a version of the GitHub API client where API calls
 * are fully mocked out and you have total control over the response APIs. This
 * object should always contain a jest.fn for every API call the app makes
 * over time.
 *
 * @example
 *
 *   const mockAPI = createMockGitHubClient();
 *   mockAPI.repos.checkCollaborator.mockResolvedValue({ data: { permission: "write" } });
 *   mockAPI.issues.addAssignees.mockResolvedValue({});
 *
 *   // Then run it through convertToOctokitAPI to use in functions
 *
 *   const api = convertToOctokitAPI(mockAPI)
 */
export const createMockGitHubClient = () => {
  const mockAPI = {
    checks: {
      listForRef: jest.fn()
    },
    teams: {
      getByName: jest.fn(),
      getMembership: jest.fn(),
    },
    search: {
      issues: jest.fn(),
    },
    paginate: jest.fn(),
  }

  return {
    mockAPI,
    api: convertToOctokitAPI(mockAPI),
  }
}

// Converts any jest.fn in the above function into a Promise to ensure
// that these two functions are kept in sync

type JestMockToPromise<Type> = {
  [Property in keyof Type]: { [SubProperty in keyof Type[Property]]: Promise<any> }
}

// Hardcoding mapped types like this makes it easy to see the results in the hover
type PromisifiedInferredJestObj = JestMockToPromise<ReturnType<typeof createMockGitHubClient>["mockAPI"]>

/**
 * A Fake GitHub client which lets you work with fake responses while working in development
 */
export const createFakeGitHubClient = () => {
  const fake: PromisifiedInferredJestObj = {
    repos: {
      checkCollaborator: Promise.resolve({}),
      getContents: Promise.resolve({}),
      getCombinedStatusForRef: Promise.resolve({}),
      createDispatchEvent: Promise.resolve({}),
    },
    issues: {
      addAssignees: Promise.resolve({}),
      createComment: Promise.resolve({}),
      listComments: Promise.resolve({}),
      replaceLabels: Promise.resolve({}),
      addLabels: Promise.resolve({}),
      removeLabel: Promise.resolve({}),
      get: Promise.resolve({}),
    },
    pulls: {
      get: Promise.resolve({}),
      merge: Promise.resolve({}),
      listFiles: Promise.resolve({}),
    },
    checks: {
      listForRef: Promise.resolve({})
    },
    teams: {
      getByName: Promise.resolve({}),
      getMembership: Promise.resolve({ status: 200 }),
    },
    search: {
      issues: Promise.resolve({}),
    },
    paginate: Promise.resolve({}) as any,
  }

  return (fake as unknown) as Octokit
}

/**
 * Assertion functions don't work when the param type is inferred,
 * so it's either set a variable like this in each test, or we hardcode
 * the return type for createMockGitHubClient. I think this is probably
 * the better option.
 */
export const convertToOctokitAPI = (mock: {}) => {
  return (mock as unknown) as Octokit
}
