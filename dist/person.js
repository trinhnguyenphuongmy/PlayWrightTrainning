"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Person = void 0;
class Person {
    constructor(name, age, city) {
        if (!name || name.trim() === "") {
            throw new Error("Name cannot be empty.");
        }
        if (age <= 0) {
            throw new Error("Age must be a positive number.");
        }
        this.name = name;
        this.age = age;
        this.city = city;
    }
    // Getters for private properties
    getName() {
        return this.name;
    }
    getAge() {
        return this.age;
    }
    getCity() {
        return this.city;
    }
    greet() {
        return `Hi, I'm ${this.name} from ${this.city}.`;
    }
    celebrateBirthday() {
        this.age++;
    }
    updateCity(newCity) {
        this.city = newCity;
    }
    isAdult() {
        return this.age >= 18;
    }
    hasSameCity(other) {
        return this.city === other.city;
    }
    toJSON() {
        return {
            name: this.name,
            age: this.age,
            city: this.city,
        };
    }
    static fromJSON(data) {
        if (!data ||
            typeof data.name !== "string" ||
            typeof data.age !== "number" ||
            typeof data.city !== "string") {
            throw new Error("Invalid data format for creating a Person instance.");
        }
        return new Person(data.name, data.age, data.city);
    }
}
exports.Person = Person;
