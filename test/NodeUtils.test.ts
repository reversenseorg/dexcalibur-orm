import {expect} from "chai";
import {NodeUtils} from "../src/NodeUtils.js";


describe('NodeUtils', function() {


    before(function () {
    })

    beforeEach(function () {
    });

    afterEach(function () {
    });

    describe('static isNode()', function () {

        it('invalid cases', function () {

            expect(NodeUtils.isNode({})).to.be.equal(false);
            expect(NodeUtils.isNode({__:1})).to.be.equal(false);
            expect(NodeUtils.isNode(null)).to.be.equal(false);
            expect(NodeUtils.isNode(undefined)).to.be.equal(false);
            expect(NodeUtils.isNode([{__:1}])).to.be.equal(false);
            expect(NodeUtils.isNode([])).to.be.equal(false);
            expect(NodeUtils.isNode(10)).to.be.equal(false);
            expect(NodeUtils.isNode({__:1, tags:[]} )).to.be.equal(false);

        });

        it('valid cases', function () {
            expect(NodeUtils.isNode({__:1, tags:[], toJsonObject:()=>{}})).to.be.equal(true);
        });
    });
});