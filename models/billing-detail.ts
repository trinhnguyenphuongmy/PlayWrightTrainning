export class BillingDetails {
  private firstName: string;
  private lastName: string;
  private companyName?: string;
  private country: string;
  private streetAddress: string;
  private city: string;
  private zipCode: string;
  private phoneNumber: string;
  private email: string;
  private orderNote?: string;

  constructor(
    firstName: string,
    lastName: string,
    country: string,
    streetAddress: string,
    city: string,
    zipCode: string,
    phoneNumber: string,
    email: string,
    companyName?: string,
    orderNote?: string
  ) {
    if (!firstName || firstName.trim() === "") {
      throw new Error("First name cannot be empty.");
    }
    if (!lastName || lastName.trim() === "") {
      throw new Error("Last name cannot be empty.");
    }
    if (!country || country.trim() === "") {
      throw new Error("Country cannot be empty.");
    }
    if (!streetAddress || streetAddress.trim() === "") {
      throw new Error("Street address cannot be empty.");
    }
    if (!city || city.trim() === "") {
      throw new Error("City cannot be empty.");
    }
    if (!zipCode || zipCode.trim() === "") {
      throw new Error("Zip code cannot be empty.");
    }
    if (!phoneNumber || phoneNumber.trim() === "") {
      throw new Error("Phone number cannot be empty.");
    }
    if (!email || email.trim() === "") {
      throw new Error("Email cannot be empty.");
    }
    this.firstName = firstName;
    this.lastName = lastName;
    this.country = country;
    this.streetAddress = streetAddress;
    this.city = city;
    this.zipCode = zipCode;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.companyName = companyName;
    this.orderNote = orderNote;
  }

  // Getters for private properties
  getFirstName(): string {
    return this.firstName;
  }
  getLastName(): string {
    return this.lastName;
  }
  getCompanyName(): string | undefined {
    return this.companyName;
  }
  getCountry(): string {
    return this.country;
  }
  getStreetAddress(): string {
    return this.streetAddress;
  }
  getCity(): string {
    return this.city;
  }
  getZipCode(): string {
    return this.zipCode;
  }
  getPhoneNumber(): string {
    return this.phoneNumber;
  }
  getEmail(): string {
    return this.email;
  }
  getOrderNote(): string | undefined {
    return this.orderNote;
  }
}
