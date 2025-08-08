describe('initialiseApiClient', () => {
  it.skip('creates when there are no records', () => {
    expect(1).toBe(1);
  });

  it.skip('updates when there are records', () => {
    expect(1).toBe(1);
  });

  it.skip('does not update existing api_client or user_account ids', () => {
    // Changing these would cause issues, e.g. api_client.id is stored in user JWT tokens,
    // so must remain the same or these tokens will become invalid every release.
    expect(1).toBe(1);
  });
});
