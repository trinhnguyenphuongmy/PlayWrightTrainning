"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const person_1 = require("./person");
const person_repository_1 = require("./person-repository");
// Define the file paths
const inputPath = path.join(__dirname, "data", "people.json");
const outputPath = path.join(__dirname, "data", "people.output.json");
const tmpPath = path.join(__dirname, "data", "peopleAfter.output.json");
//Main test function
const repository = new person_repository_1.PersonRepository(inputPath, outputPath);
//Load the people from JSON
const people = repository.loadPeople();
if (people.length === 0) {
    console.log("No people loaded. Please check your input file.");
}
else {
    console.log(`Loaded ${people.length} people from ${inputPath}`);
}
console.log("");
//Add a new person
people.push(new person_1.Person("MyMy", 16, "HCM City"));
//Call celebrateBirthday() on each person
people.forEach((person) => person.celebrateBirthday());
//Print each person's info:
people.forEach((person) => {
    console.log(person.greet());
    console.log(`I'm ${person.getAge()} years old.`);
    if (person.isAdult()) {
        console.log("I'm an adult.");
    }
    else {
        console.log("I'm not an adult.");
    }
    console.log("");
});
//Save the updated list to people.output.json
repository.savePeople(people);
//Reload and check if the new person was saved
const updatedRepository = new person_repository_1.PersonRepository(outputPath, tmpPath);
const updatedPeople = updatedRepository.loadPeople();
const mymy = updatedPeople.find((p) => p.getName() === "MyMy");
if (mymy) {
    console.log(`New person ${mymy.getName()} was added to output file successfully.`);
}
else {
    console.log(`New person MyMy was NOT found in the output file.`);
}
//Check hasSameCity method
const john = people.find((p) => p.getName() === "John Doe");
const jane = people.find((p) => p.getName() === "Jane Smith");
if (john && jane) {
    console.log("Do John Doe and Jane Smith live in the same city?", john.hasSameCity(jane));
}
else {
    console.log("John Doe or Jane Smith not found in the list.");
}
