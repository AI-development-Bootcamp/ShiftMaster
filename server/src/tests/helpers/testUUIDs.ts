/**
 * Test UUIDs for consistent test data
 * Use these instead of generating random UUIDs in tests for predictability
 */

export const TEST_UUIDS = {
  USER_1: '550e8400-e29b-41d4-a716-446655440000',
  USER_2: '550e8400-e29b-41d4-a716-446655440001',
  USER_3: '550e8400-e29b-41d4-a716-446655440002',
  USER_4: '550e8400-e29b-41d4-a716-446655440003',
  USER_5: '550e8400-e29b-41d4-a716-446655440004',
  ADMIN_USER: '550e8400-e29b-41d4-a716-446655440999',
  MANAGER_USER: '550e8400-e29b-41d4-a716-446655440998',
} as const;

/**
 * Helper to validate UUID format in tests
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
