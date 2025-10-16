/**
 * Jednoduché testy pro ověření, že testovací prostředí funguje
 */
describe('Simple Tests', () => {
  test('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle strings', () => {
    const greeting = 'Hello, World!';
    expect(greeting).toContain('Hello');
    expect(greeting.length).toBeGreaterThan(0);
  });

  test('should handle arrays', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers).toHaveLength(5);
    expect(numbers).toContain(3);
    expect(numbers[0]).toBe(1);
  });

  test('should handle objects', () => {
    const user = {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    };
    
    expect(user).toHaveProperty('name');
    expect(user.name).toBe('John Doe');
    expect(user.email).toContain('@');
  });
});
