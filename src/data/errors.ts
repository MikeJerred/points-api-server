export class CampaignNotFoundError extends Error {
  constructor(campaignId: number) {
    super(`No campaign found with id "${campaignId}".`);
  }
}

export class InvalidApiKeyError extends Error {
  constructor() {
    super('API Key does not have access to this resource.');
  }
}
