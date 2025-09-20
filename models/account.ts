export class Account {
  private email: string;
  private password: string;

  constructor(email: string, password: string) {
    if (!email || email.trim() === "") {
      throw new Error("Email cannot be empty.");
    }
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
    this.email = email;
    this.password = password;
  }

  // Getters for private properties
  getEmail(): string {
    return this.email;
  }
  getPassword(): string {
    return this.password;
  }

  static async generateRandomEmail(): Promise<string> {
    const domains = ["example.com", "test.com", "demo.com"];
    const randomName = Math.random().toString(36).substring(2, 10);
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    return `${randomName}@${randomDomain}`;
  }
  static async generateRandomPassword(): Promise<string> {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  static async createRandomAccount(): Promise<Account> {
    // Code to create an account
    const genMail = await Account.generateRandomEmail();
    const genPass = await Account.generateRandomPassword();
    return new Account(genMail, genPass);
  }
}
