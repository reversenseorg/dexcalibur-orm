import {expect} from "chai";
import {ValidationRule, ValidationType} from "../src/security/Validator.js";

describe("ValidationRule", () => {

    describe("Constructor", () => {
        it("should initialize with type and options", () => {
            const rule = new ValidationRule(ValidationType.EQUAL, "testValue");
            expect(rule.type).to.equal(ValidationType.EQUAL);
            expect(rule.refValue).to.equal("testValue");
        });

        it("should set testFunc when type is CUSTOM", () => {
            const testFunc = (value: any) => value === "test";
            const rule = new ValidationRule(ValidationType.CUSTOM, testFunc);
            expect(rule.testFunc).to.equal(testFunc);
        });
    });

    describe("Static isRule", () => {
        it("should return true for valid ValidationRule objects", () => {
            const rule = new ValidationRule(ValidationType.EQUAL, "value");
            expect(ValidationRule.isRule(rule)).to.be.true;
        });

        it("should return false for invalid objects", () => {
            expect(ValidationRule.isRule({})).to.be.false;
            expect(ValidationRule.isRule(null)).to.be.false;
        });
    });

    describe("Static newEqualAssert", () => {
        it("should create an EQUAL validation rule", () => {
            const rule = ValidationRule.newEqualAssert("testValue");
            expect(rule.type).to.equal(ValidationType.EQUAL);
            expect(rule.refValue).to.equal("testValue");
        });
    });

    describe("Static newPinklistAssert", () => {
        it("should create a PINKLIST validation rule", () => {
            const pinklist = ["value1", "value2"];
            const rule = ValidationRule.newPinklistAssert(pinklist);
            expect(rule.type).to.equal(ValidationType.PINKLIST);
            expect(rule.refValue).to.deep.equal(pinklist);
        });
    });

    describe("Static newRegexpAssert", () => {
        it("should create a REGEXP validation rule", () => {
            const regexp = /test/;
            const rule = ValidationRule.newRegexpAssert(regexp);
            expect(rule.type).to.equal(ValidationType.REGEXP);
            expect(rule.refValue).to.equal(regexp);
        });
    });

    describe("Static newCustomAssert", () => {
        it("should create a CUSTOM validation rule with a function", () => {
            const testFunc = (value: any) => value > 10;
            const rule = ValidationRule.newCustomAssert(testFunc);
            expect(rule.type).to.equal(ValidationType.CUSTOM);
            expect(rule.testFunc).to.equal(testFunc);
        });
    });

    describe("Test Method", () => {
        it("should correctly validate using EQUAL type", () => {
            const rule = new ValidationRule(ValidationType.EQUAL, "value");
            expect(rule.test("value")).to.be.true;
            expect(rule.test("wrongValue")).to.be.false;
        });

        it("should correctly validate using PINKLIST type", () => {
            const rule = new ValidationRule(ValidationType.PINKLIST, ["value1", "value2"]);
            expect(rule.test("value1")).to.be.true;
            expect(rule.test("value3")).to.be.false;
        });

        it("should correctly validate using REGEXP type", () => {
            const rule = new ValidationRule(ValidationType.REGEXP, /^test$/);
            expect(rule.test("test")).to.be.true;
            expect(rule.test("notTest")).to.be.false;
        });

        it("should correctly validate using CUSTOM type", () => {
            const customFunc = (value: any) => typeof value === "number" && value > 10;
            const rule = new ValidationRule(ValidationType.CUSTOM, customFunc);
            expect(rule.test(15)).to.be.true;
            expect(rule.test(5)).to.be.false;
        });
    });

    describe("Static asArrayOf", () => {
        it("should validate an array against multiple validation rules", () => {
            const rule1 = ValidationRule.newCustomAssert((value: any) => typeof value === "string");
            const rule2 = ValidationRule.newRegexpAssert(/^test/);

            const arrayRule = ValidationRule.asArrayOf([rule1, rule2]);
            expect(arrayRule.test(["test1", "test2"])).to.be.true;
            expect(arrayRule.test(["test1", 123])).to.be.false;
        });
    });

    describe("Static bool", () => {
        it("should validate boolean values", () => {
            const rule = ValidationRule.bool();
            expect(rule.test(true)).to.be.true;
            expect(rule.test(false)).to.be.true;
            expect(rule.test("notBoolean")).to.be.false;
        });
    });

    describe("Static number", () => {
        it("should validate numbers within a range", () => {
            const rule = ValidationRule.number(1, 10);
            expect(rule.test(5)).to.be.true;
            expect(rule.test(0)).to.be.false;
        });
    });

    describe('Validator.structure', function() {

        enum ProjectInputPurpose{
            MAIN="main",
            EXTRA="extra"
        }

        const rule = (ValidationRule.structure({
            uploadID: ValidationRule.newRegexpAssert(
                /^[0-9a-z]{16,17}$/
            ),
            purpose: ValidationRule.newPinklistAssert([
                ProjectInputPurpose.MAIN,
                ProjectInputPurpose.EXTRA
            ])
        }));

        const rule2 = (ValidationRule.structure({
            uploadID: ValidationRule.newRegexpAssert(
                /^[0-9a-z]{16,17}$/
            ),
            extra: ValidationRule.structure({
                purpose: ValidationRule.newPinklistAssert([
                    ProjectInputPurpose.MAIN,
                    ProjectInputPurpose.EXTRA
                ])
            })
        }));

        console.log((rule as any)._o.z);
        console.log((rule2 as any)._o.z);

        const valid = {
            uploadID: 'ufy7k7kig3yfl0gbm',
            purpose: 'main'
        };

        it('with valid input', function () {
            expect(rule.test(valid)).to.be.true;
        });

        it('NULL input', function () {
            expect(rule.test(null)).to.be.false;
        });

        it('UNDEFINED input', function () {
            expect(rule.test(undefined)).to.be.false;
        });

        it('Object input', function () {
            expect(rule.test({})).to.be.false;
        });

        it('Array input', function () {
            expect(rule.test([])).to.be.false;
        });

        it('Function input', function () {
            expect(rule.test(()=>{})).to.be.false;
        });

        it('number input', function () {
            expect(rule.test(10)).to.be.false;
        });

        it('Infinity input', function () {
            expect(rule.test(Infinity)).to.be.false;
        });

        it('NaN input', function () {
            expect(rule.test(NaN)).to.be.false;
        });
    });

    describe('Validator.asArrayOf', function() {

        enum ProjectInputPurpose{
            MAIN="main",
            EXTRA="extra"
        }

        const rule = ValidationRule.asArrayOf([
            ValidationRule.structure({
                uploadID: ValidationRule.newRegexpAssert(
                    /^[0-9a-z]{16,17}$/
                ),
                purpose: ValidationRule.newPinklistAssert([
                    ProjectInputPurpose.MAIN,
                    ProjectInputPurpose.EXTRA
                ])
            })
        ]);

        const valid = [{
            uploadID: 'ufy7k7kig3yfl0gbm',
            purpose: 'main'
        },{
            uploadID: 'jejeofepfjahajkaj',
            purpose: 'extra'
        }];

        it('with valid input', function () {
            expect(rule.test(valid)).to.be.true;
        });

        it('Empty Array', function () {
            expect(rule.test([])).to.be.true;
        });

        it('NULL input', function () {
            expect(rule.test(null)).to.be.false;
        });

        it('UNDEFINED input', function () {
            expect(rule.test(undefined)).to.be.false;
        });

        it('Object input', function () {
            expect(rule.test({})).to.be.false;
        });


        it('Function input', function () {
            expect(rule.test(()=>{})).to.be.false;
        });

        it('number input', function () {
            expect(rule.test(10)).to.be.false;
        });

        it('Infinity input', function () {
            expect(rule.test(Infinity)).to.be.false;
        });

        it('NaN input', function () {
            expect(rule.test(NaN)).to.be.false;
        });
    });
});