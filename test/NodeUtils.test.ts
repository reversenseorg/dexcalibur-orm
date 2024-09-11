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
            expect(NodeUtils.isNode({__:1, tags:[], toJsonObject:()=>{}})).to.be.equal(false);

        });

        it('valid cases', function () {
            expect(NodeUtils.isNode({__:1, tags:[], getUID:()=>{return 'toto'}, toJsonObject:()=>{}})).to.be.equal(true);

        });
    });


    describe('static serialize()', function () {

        class TestNode {
            __ = 1;
            tags = [];
            a:number;
            b:string;
            constructor(a:number,b:string) {
                this.a = a;
                this.b = b;
            }

            getUID():string {
                return this.b;
            }

            toJsonObject():any {
                return {
                    a: this.a,
                    b: this.b
                }
            }
        }

        it('simple INode', function () {

            const node = new TestNode(1,'toto');
            const serial = NodeUtils.serialize(node);

            expect(serial.__).to.be.equal(undefined);
            expect(serial).to.deep.equal({ a:1, b:'toto' });
        });

        it('array of INode', function () {

            const nodes = [
                new TestNode(1, 'toto'),
                new TestNode( 2, 'babar'),
                10
            ];
            const serial = NodeUtils.serialize(nodes as any);

            expect(serial).to.be.an('array');
            expect(serial).to.deep.equal([{ a:1, b:'toto' },{ a:2, b:'babar' },10]);
        });
    });
});