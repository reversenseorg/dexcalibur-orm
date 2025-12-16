import {expect} from "chai";
import {NodeProperty, NodePropertyState} from "../src/NodeProperty.js";
import {DbDataType, DbKeyType, DbSerialize} from "../src/DbAbstraction.js";
import {Node} from "../src/INode.js";
import {NodeTransform, NodeType} from "../src/NodeType.js";
import {IStringIndex} from "../src/core/IStringIndex.js";


describe('NodeType', function() {


    before(function () {
    })

    beforeEach(function () {
    });

    afterEach(function () {
    });

    describe('new NodeType', function () {

        it('new node', function () {

            const CUSTOM_NODE_INTERNAL_TYPE = 10;

            const node_t = new NodeType( "hook_session", CUSTOM_NODE_INTERNAL_TYPE,
                [
                    (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
                    (new NodeProperty("hookManager")).volatile(),
                    (new NodeProperty("sets_matches")).volatile().def(null),
                    (new NodeProperty("time")).type(DbDataType.NUMERIC).def(-1),
                    (new NodeProperty("frida"))
                        .type(DbDataType.STRING)
                        .sleep( (x:NodePropertyState)=>{
                            if(x.p==null) return {};

                            return JSON.stringify({
                                pid: x.p.pid,
                                session: null,
                                device: null,
                                script: null
                            });
                        })
                        .wakeUp( (x:NodePropertyState)=>{
                            return (x.p!=null ? JSON.parse(x.p) : null);
                        })
                        .def(0),
                    (new NodeProperty("active")).type(DbDataType.BOOLEAN).def(false),
                    (new NodeProperty("opts")).type(DbDataType.STRING).serialize(DbSerialize.JSON).def(null),
                    (new NodeProperty("offset")).type(DbDataType.NUMERIC).def(0),
                    (new NodeProperty("evTags"))
                        .type(DbDataType.STRING)
                        .sleep( (x:NodePropertyState)=>{
                            //const t = Object.keys(x.p);
                            return JSON.stringify(Object.keys(x.p));
                        })
                        .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : null)})
                        .def(0)
                ]).descr("Help to save a hook session");


            expect(node_t).to.be.instanceOf(NodeType);
            expect(node_t.getName()).to.equal("hook_session");
            expect(node_t.getType()).to.equal(CUSTOM_NODE_INTERNAL_TYPE);
            expect(node_t.getProperties().length).to.equal(9);
            expect(node_t.getDescr()).to.equal("Help to save a hook session");
        });

        it('new node type without property', function () {

            const CUSTOM_NODE_INTERNAL_TYPE = 11;

            const node_t = new NodeType( "hook_session", CUSTOM_NODE_INTERNAL_TYPE,[]);


            expect(node_t).to.be.instanceOf(NodeType);
            expect(node_t.getName()).to.equal("hook_session");
            expect(node_t.getType()).to.equal(CUSTOM_NODE_INTERNAL_TYPE);
            expect(node_t.getProperties().length).to.equal(0);
        });


    });


    describe('addProperty', function () {

        it('new node type without property', function () {

            const CUSTOM_NODE_INTERNAL_TYPE = 11;

            const node_t = new NodeType( "hook_session", CUSTOM_NODE_INTERNAL_TYPE,[]);
            expect(node_t.getProperties().length).to.equal(0);

            node_t.addProperty("new_name", (new NodeProperty("original_name")).type(DbDataType.INTEGER).def(1));

            expect(node_t.getProperties().length).to.equal(1);
            expect(node_t.getProperty("new_name")).to.be.instanceOf(NodeProperty);
            expect(node_t.getProperty("original_name")).to.be.undefined;
            expect(node_t.getProperty("new_name").getType()).to.equal(DbDataType.INTEGER);
        });

        it('new node type with existing properties', function () {

            const CUSTOM_NODE_INTERNAL_TYPE = 11;

            const node_t = new NodeType( "hook_session", CUSTOM_NODE_INTERNAL_TYPE,[
                (new NodeProperty("hookManager")).volatile(),
            ]);
            expect(node_t.getProperties().length).to.equal(1);

            node_t.addProperty("new_name", (new NodeProperty("original_name")).type(DbDataType.INTEGER).def(1));

            expect(node_t.getProperties().length).to.equal(2);
            expect(node_t.getProperty("new_name")).to.be.instanceOf(NodeProperty);
            expect(node_t.getProperty("original_name")).to.be.undefined;
            expect(node_t.getProperty("new_name").getType()).to.equal(DbDataType.INTEGER);
        });


        it('add a property with conflict on name', function () {

            const CUSTOM_NODE_INTERNAL_TYPE = 11;

            const node_t = new NodeType( "hook_session", CUSTOM_NODE_INTERNAL_TYPE,[
                (new NodeProperty("new_name")).type(DbDataType.STRING).volatile(),
            ]);
            expect(node_t.getProperties().length).to.equal(1);

            node_t.addProperty("new_name", (new NodeProperty("original_name")).type(DbDataType.INTEGER).def(1));

            expect(node_t.getProperties().length).to.equal(1);
            expect(node_t.getProperty("new_name")).to.be.instanceOf(NodeProperty);
            expect(node_t.getProperty("new_name").getType()).to.equal(DbDataType.INTEGER);
            expect(node_t.getProperty("new_name").getDefaultValue()).to.equal(1);
        });
    });



    describe('getProperty', function () {

        it('get existing ppt', function () {

            const CUSTOM_NODE_INTERNAL_TYPE = 11;

            const node_t = new NodeType( "hook_session", CUSTOM_NODE_INTERNAL_TYPE,[
                (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
                (new NodeProperty("hookManager")).volatile()
            ]);

            expect(node_t.getProperty("_uid")).to.be.instanceOf(NodeProperty);
            expect(node_t.getProperty("_uid").getType()).to.equal(DbDataType.STRING);
            expect(node_t.getProperty("_uid").isPrimaryKey()).to.true;
            expect(node_t.getProperty("hookManager").isVolatile()).to.true;
            expect(node_t.getProperty("hookManager").isPrimaryKey()).to.false;
        });

        it('get missing ppt', function () {

            const CUSTOM_NODE_INTERNAL_TYPE = 11;

            const node_t = new NodeType( "hook_session", CUSTOM_NODE_INTERNAL_TYPE,[
                (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
                (new NodeProperty("hookManager")).volatile()
            ]);

            expect(node_t.getProperty("missing_ppt")).to.be.undefined;
        });
    });


    describe('getProperties', function () {

        it('get all existing ppts', function () {

            const CUSTOM_NODE_INTERNAL_TYPE = 11;

            const node_t = new NodeType( "hook_session", CUSTOM_NODE_INTERNAL_TYPE,[
                (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
                (new NodeProperty("hookManager")).volatile()
            ]);

            const ppts = node_t.getProperties();
            expect(ppts.length).to.be.equal(2);
            expect(ppts[0].getType()).to.equal(DbDataType.STRING);
            expect(ppts[1].isVolatile()).to.be.true;
        });
    });



    describe('asForeignKey', function () {

        it('use the node type as a foreign key, to compute *join request', function () {

            const CUSTOM_NODE_INTERNAL_TYPE = 11;

            const node_t = new NodeType( "hook_session", CUSTOM_NODE_INTERNAL_TYPE,[
                (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
                (new NodeProperty("hookManager")).volatile()
            ]);

            const fk = node_t.asForeignKey(DbKeyType.FOREIGN, 1, "hook_session_id");
            expect(fk.isForeignKey()).to.be.true;
            expect(fk.getType()).to.be.equals(DbDataType.STRING);
            expect(fk.getName()).to.be.equal("hook_session_id");
        });

        it('use the node type as a part of a composite key, to compute complex *join request', function () {

            const hk_session_t = new NodeType( "hook_session", 11,[
                (new NodeProperty("_uid")).type(DbDataType.INTEGER).key(DbKeyType.PRIMARY),
                (new NodeProperty("hookManager")).volatile()
            ]);

            const msg_t = new NodeType( "message", 12,[
                (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
                (new NodeProperty("session")).single(hk_session_t)
            ]);


            expect(hk_session_t.getProperty("_uid").isCompositeKey()).to.be.false;

            const fk = hk_session_t.asForeignKey(DbKeyType.COMPOSITE, 1, "hook_session_id");

            expect(fk.isCompositeKey()).to.be.true;
            expect(fk.getType()).to.be.equals(DbDataType.INTEGER);
            expect(fk.getName()).to.be.equal("hook_session_id");
        });
    });

    describe('getCompositeKey', function () {

        it('composite key with 2 keys', function () {

            const CUSTOM_NODE_INTERNAL_TYPE = 11;

            const node_t = new NodeType( "hook_session", CUSTOM_NODE_INTERNAL_TYPE,[
                (new NodeProperty("_uid")).type(DbDataType.INTEGER).key(DbKeyType.COMPOSITE, 1),
                (new NodeProperty("date")).type(DbDataType.STRING).key(DbKeyType.COMPOSITE, 0),
                (new NodeProperty("hookManager")).volatile()
            ]);

            const ppts = node_t.getCompositeKey();
            expect(ppts.length).to.be.equal(2);
            expect(ppts[0].getType()).to.equal(DbDataType.STRING);
            expect(ppts[0].getName()).to.equal("date");
            expect(ppts[1].getType()).to.equal(DbDataType.INTEGER);
            expect(ppts[1].getName()).to.equal("_uid");
        });
    });


    describe('set builder', function () {

        it('composite key with 2 keys', function () {

            class Stub extends Node {

                static __:NodeType = new NodeType( "stub", 11,[
                    (new NodeProperty("_uid")).type(DbDataType.INTEGER).key(DbKeyType.PRIMARY),
                    (new NodeProperty("name")).type(DbDataType.STRING).def("test"),
                    (new NodeProperty("desc")).type(DbDataType.STRING).def("-"),
                    (new NodeProperty("hookManager")).volatile()
                ]);

                _uid:number;

                name:string;

                date:string;

                hookManager:any;

                constructor( pConfig:any = {}) {
                    super();

                    for(let i in pConfig) (this as IStringIndex<any>)[i] = pConfig[i];
                }
            }

            Stub.__.builder(Stub);

            expect(Stub.__.getBuilder()).to.instanceOf(Function);
            expect( new (Stub.__.getBuilder())()).to.instanceOf(Stub);

            const stub_A = new (Stub.__.getBuilder())({ _uid:1, name:"AAA" });
            expect(stub_A).to.be.instanceOf(Stub);
            expect(stub_A.name).to.be.equals("AAA");
            expect(stub_A.desc).to.be.undefined;

            expect(stub_A[Stub.__.getPrimaryKey().getName()]).to.be.equal(1);

        });
    });



    describe('toArrayHeaders', function () {


            const CUSTOM_NODE_INTERNAL_TYPE = 10;

            const node_t = new NodeType( "hook_session", CUSTOM_NODE_INTERNAL_TYPE,
                [
                    (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
                    (new NodeProperty("hookManager")).volatile(),
                    (new NodeProperty("sets_matches")).volatile().def(null),
                    (new NodeProperty("time")).type(DbDataType.NUMERIC).def(-1),
                    (new NodeProperty("frida"))
                        .type(DbDataType.STRING)
                        .sleep( (x:NodePropertyState)=>{
                            if(x.p==null) return {};

                            return JSON.stringify({
                                pid: x.p.pid,
                                session: null,
                                device: null,
                                script: null
                            });
                        })
                        .wakeUp( (x:NodePropertyState)=>{
                            return (x.p!=null ? JSON.parse(x.p) : null);
                        })
                        .def(0),
                    (new NodeProperty("active")).type(DbDataType.BOOLEAN).def(false),
                    (new NodeProperty("opts")).type(DbDataType.STRING).serialize(DbSerialize.JSON).def(null),
                    (new NodeProperty("offset")).type(DbDataType.NUMERIC).def(0),
                    (new NodeProperty("evTags"))
                        .type(DbDataType.STRING)
                        .sleep( (x:NodePropertyState)=>{
                            //const t = Object.keys(x.p);
                            return JSON.stringify(Object.keys(x.p));
                        })
                        .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : null)})
                        .def(0)
                ]);

            it('all properties', function (){
                const col = NodeType.toArrayHeader();
                expect(col).to.have.members([
                    "_name",
                    "_type",
                    "_ppts",
                    "_pk",
                    "_wrap",
                    "_dsa",
                    "_ds",
                    "_cpk",
                    "_dscr"
                ]);
            });

            it('filtered properties', function (){
                const col = NodeType.toArrayHeader(['aaa']);
                expect(col).to.have.members([
                    "_name",
                    "_type",
                    "_ppts",
                    "_pk",
                    "_wrap",
                    "_dsa",
                    "_ds",
                    "_cpk",
                    "_dscr",
                    "aaa"
                ]);
            });

            it('no properties', function (){
                const col = NodeType.toArrayHeader([]);
                expect(col).to.have.members([
                    "_name",
                    "_type",
                    "_ppts",
                    "_pk",
                    "_wrap",
                    "_dsa",
                    "_ds",
                    "_cpk",
                    "_dscr"
                ]);
            });
    });

    describe('toArrayValue', function () {


        const CUSTOM_NODE_INTERNAL_TYPE = 10;

        const node_t = new NodeType( "hook_session", CUSTOM_NODE_INTERNAL_TYPE,
            [
                (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
                (new NodeProperty("hookManager")).volatile(),
                (new NodeProperty("sets_matches")).volatile().def(null),
                (new NodeProperty("time")).type(DbDataType.NUMERIC).def(-1),
                (new NodeProperty("frida"))
                    .type(DbDataType.STRING)
                    .sleep( (x:NodePropertyState)=>{
                        if(x.p==null) return {};

                        return JSON.stringify({
                            pid: x.p.pid,
                            session: null,
                            device: null,
                            script: null
                        });
                    })
                    .wakeUp( (x:NodePropertyState)=>{
                        return (x.p!=null ? JSON.parse(x.p) : null);
                    })
                    .def(0),
                (new NodeProperty("active")).type(DbDataType.BOOLEAN).def(false),
                (new NodeProperty("opts")).type(DbDataType.STRING).serialize(DbSerialize.JSON).def(null),
                (new NodeProperty("offset")).type(DbDataType.NUMERIC).def(0),
                (new NodeProperty("evTags"))
                    .type(DbDataType.STRING)
                    .sleep( (x:NodePropertyState)=>{
                        //const t = Object.keys(x.p);
                        return JSON.stringify(Object.keys(x.p));
                    })
                    .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : null)})
                    .def(0)
            ]);

        it('properties:subset, transform: none', function (){
            const values = node_t.toArrayValue([
                "_name",
                "_type",
                "_ppts"
            ], NodeTransform.NONE);

            expect(values[0]).to.be.equal("hook_session");
            expect(values[1]).to.be.equal(CUSTOM_NODE_INTERNAL_TYPE);
            expect((values[2]._uid as NodeProperty).getName()).to.be.equal("_uid");
            expect((values[2].hookManager as NodeProperty).getName()).to.be.equal("hookManager");
            expect(values[3]).to.be.equal(undefined);
        });

        it('properties: subset, transform: json', function (){
            const values = node_t.toArrayValue([
                "_name",
                "_type",
                "_ppts"
            ], NodeTransform.JSON);

            expect(values[0]).to.be.equal("hook_session");
            expect(values[1]).to.be.equal(CUSTOM_NODE_INTERNAL_TYPE);
            expect(values[2]._uid.name).to.be.equal("_uid");
            expect(values[2]._uid.type).to.be.equal(DbDataType.STRING);
            expect(values[2]._uid.keyType).to.be.equal(DbKeyType.PRIMARY);
            expect(values[3]).to.be.equal(undefined);
        });


        it('properties: subset, transform: array', function (){
            const values = node_t.toArrayValue([
                "_name",
                "_type",
                "_ppts"
            ], NodeTransform.ARRAY);

            const header = NodeProperty.toArrayHeader();

            expect(values[0]).to.be.equal("hook_session");
            expect(values[1]).to.be.equal(CUSTOM_NODE_INTERNAL_TYPE);
            expect(values[2][0][header.indexOf("_name")]).to.be.equal("_uid");
            expect(values[2][2][header.indexOf("_name")]).to.be.equal("sets_matches");
            expect(values[2][0][header.indexOf("_type")]).to.be.equal(DbDataType.STRING);
            expect(values[3]).to.be.equal(undefined);
        });

    });


    describe('toJsonObject', function () {

        it('all ', function () {

            const CUSTOM_NODE_INTERNAL_TYPE = 10;

            const node_t = new NodeType( "hook_session", CUSTOM_NODE_INTERNAL_TYPE,
                [
                    (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
                    (new NodeProperty("hookManager")).volatile(),
                    (new NodeProperty("sets_matches")).volatile().def(null),
                    (new NodeProperty("time")).type(DbDataType.NUMERIC).def(-1),
                    (new NodeProperty("frida"))
                        .type(DbDataType.STRING)
                        .sleep( (x:NodePropertyState)=>{
                            if(x.p==null) return {};

                            return JSON.stringify({
                                pid: x.p.pid,
                                session: null,
                                device: null,
                                script: null
                            });
                        })
                        .wakeUp( (x:NodePropertyState)=>{
                            return (x.p!=null ? JSON.parse(x.p) : null);
                        })
                        .def(0),
                    (new NodeProperty("active")).type(DbDataType.BOOLEAN).def(false),
                    (new NodeProperty("opts")).type(DbDataType.STRING).serialize(DbSerialize.JSON).def(null),
                    (new NodeProperty("offset")).type(DbDataType.NUMERIC).def(0),
                    (new NodeProperty("evTags"))
                        .type(DbDataType.STRING)
                        .sleep( (x:NodePropertyState)=>{
                            //const t = Object.keys(x.p);
                            return JSON.stringify(Object.keys(x.p));
                        })
                        .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : null)})
                        .def(0)
                ]);


            console.log(node_t.toJsonObject(true))
            /*
            expect(node_t).to.be.instanceOf(NodeType);
            expect(node_t.getName()).to.equal("hook_session");
            expect(node_t.getType()).to.equal(CUSTOM_NODE_INTERNAL_TYPE);
            expect(node_t.getProperties().length).to.equal(9);*/
        });


    });

});