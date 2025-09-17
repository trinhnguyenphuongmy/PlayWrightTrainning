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
exports.PersonRepository = void 0;
const fs = __importStar(require("fs"));
const person_1 = require("./person");
class PersonRepository {
    constructor(filePath, outputFilePath) {
        this.filePath = filePath;
        this.outputFilePath = outputFilePath;
    }
    loadPeople() {
        //Load people from data/people.json
        try {
            if (!fs.existsSync(this.filePath)) {
                console.error(`File not found at path: ${this.filePath}`);
                return [];
            }
            const fileContent = fs.readFileSync(this.filePath, "utf-8");
            const data = JSON.parse(fileContent);
            // Validate that the loaded data is an array
            if (!Array.isArray(data)) {
                console.error("JSON data is not an array.");
                return [];
            }
            //Map them to Person instances using Person.fromJSON
            return data.map((item) => person_1.Person.fromJSON(item));
        }
        catch (error) {
            console.error("Error loading people:", error.message);
            return []; // Return an empty array on error
        }
    }
    //Save people to data/people.output.json
    savePeople(people) {
        try {
            const dataToSave = people.map((person) => person.toJSON());
            const jsonString = JSON.stringify(dataToSave, null, 2);
            fs.writeFileSync(this.outputFilePath, jsonString, "utf-8");
            console.log(`Successfully saved ${people.length} people to ${this.outputFilePath}`);
            console.log("");
        }
        catch (error) {
            console.error("Error saving people:", error.message);
        }
    }
}
exports.PersonRepository = PersonRepository;
