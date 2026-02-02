import {expect} from "chai";
import {NodeProperty, NodePropertyState} from "../src/NodeProperty.js";
import {DbDataType, DbKeyType, DbSerialize} from "../src/DbAbstraction.js";
import {NodeTransform, NodeType} from "../src/NodeType.js";
import {NodeInternalType} from "../src/NodeInternalType.js";
import {INode} from "../src/INode.js";


describe('NodeProperty', function() {


    before(function () {
    })

    beforeEach(function () {
    });

    afterEach(function () {
    });

    describe('new NodeProperty', function () {

        /*
        (new NodeProperty("__s")).type(DbDataType.STRING).key(DbKeyType.PRIMARY), // path relative to scope root
            //(new NodeProperty("_uid")).type(DbDataType.STRING), //.key(DbKeyType.PRIMARY),
            (new NodeProperty("name")).type(DbDataType.STRING).def(null),
            (new NodeProperty("symbol")).type(DbDataType.STRING).def(null),
            (new NodeProperty("alias")).type(DbDataType.STRING).def(null),
            (new NodeProperty("nbbs")).type(DbDataType.INTEGER).def(-1),
            (new NodeProperty("addr")).type(DbDataType.INTEGER).def(-1),
            (new NodeProperty("edges")).type(DbDataType.INTEGER).def(0),
            (new NodeProperty("src")).single(ModelFile.TYPE),
            (new NodeProperty("stack")).type(DbDataType.INTEGER).def(-1),
            (new NodeProperty("sz")).type(DbDataType.INTEGER).def(-1),
            (new NodeProperty("tags")).type(DbDataType.STRING).serialize(DbSerialize.JSON).def("[]"),
         */
        it('new node', function () {
            let ppt: NodeProperty = new NodeProperty("symbol");
            expect(ppt.getName()).to.equals("symbol");
        });

        it('new node with empty name', function () {

            let ppt: NodeProperty;
            let f = 0;
            try {
                ppt = new NodeProperty(null);
            }catch(e){
                f++;
            }finally {
                expect(f).to.equals(1);
            }

            expect(ppt).to.be.undefined;
        });



        it('new node with NULL name', function () {

            let ppt: NodeProperty;
            let f = 0;
            try {
                ppt = new NodeProperty("");
            }catch(e){
                f++;
            }finally {
                expect(f).to.equals(1);
            }

            expect(ppt).to.be.undefined;
        });



        it('new node with UNDEFINED name', function () {

            let ppt: NodeProperty;
            let f = 0;
            try {
                ppt = new NodeProperty(undefined);
            }catch(e){
                f++;
            }finally {
                expect(f).to.equals(1);
            }

            expect(ppt).to.be.undefined;
        });

        it('have chainable methods', function () {

            let ppt: NodeProperty = (new NodeProperty("__d")).type(DbDataType.INTEGER);


            expect(ppt).to.be.instanceOf(NodeProperty);
            expect(ppt.getName()).to.equals("__d");
            expect(ppt.getType()).to.equals(DbDataType.INTEGER);


            let ppt2: NodeProperty = (new NodeProperty("__s")).type(DbDataType.STRING).key(DbKeyType.PRIMARY);

            expect(ppt2).to.be.instanceOf(NodeProperty);
            expect(ppt2.getName()).to.equals("__s");
            expect(ppt2.getType()).to.equals(DbDataType.STRING);
            expect(ppt2.isPrimaryKey()).to.be.true;
        });
    });


    describe('setting Data Type', function () {

        it('using DbDataType.STRING', function () {
            let ppt: NodeProperty = (new NodeProperty("symbol")).type(DbDataType.STRING);
            expect(ppt.getType()).to.equals(DbDataType.STRING);
        });

        it('is chainable', function () {
            let ppt: NodeProperty = (new NodeProperty("symbol")).type(DbDataType.STRING);
            expect(ppt).to.be.instanceOf(NodeProperty);
        });
    });


    describe('setting default value', function () {

        it('using DbDataType.STRING', function () {
            let ppt: NodeProperty = (new NodeProperty("symbol")).def("xxx");
            expect(ppt.getDefaultValue()).to.equals("xxx");
            expect(ppt).to.be.instanceOf(NodeProperty);
        });

        it('getting undefined default value', function () {
            let ppt: NodeProperty = (new NodeProperty("symbol"));
            expect(ppt.getDefaultValue()).to.be.undefined;
            expect(ppt.getDefaultValue()).to.be.not.null;
        });
    });


    describe('mark as key', function () {

        it('primary key', function () {
            let attr: NodeProperty = (new NodeProperty("symbol"));
            expect(attr.isPrimaryKey()).to.be.false;

            let ppt: NodeProperty = (new NodeProperty("symbol")).key(DbKeyType.PRIMARY);
            expect(ppt.isPrimaryKey()).to.be.true;

            let ppt2: NodeProperty = (new NodeProperty("symbol")).key(DbKeyType.COMPOSITE);
            expect(ppt2.isPrimaryKey()).to.be.false;

            let ppt3: NodeProperty = (new NodeProperty("symbol")).key(DbKeyType.FOREIGN);
            expect(ppt3.isPrimaryKey()).to.be.false;

            expect(ppt).to.be.instanceOf(NodeProperty);
        });



        it('foreign key', function () {
            let attr: NodeProperty = (new NodeProperty("symbol"));
            expect(attr.isForeignKey()).to.be.false;

            let ppt: NodeProperty = (new NodeProperty("symbol")).key(DbKeyType.FOREIGN);
            expect(ppt.isForeignKey()).to.be.true;

            let ppt2: NodeProperty = (new NodeProperty("symbol")).key(DbKeyType.COMPOSITE);
            expect(ppt2.isForeignKey()).to.be.false;

            let ppt3: NodeProperty = (new NodeProperty("symbol")).key(DbKeyType.PRIMARY);
            expect(ppt3.isForeignKey()).to.be.false;

            expect(ppt).to.be.instanceOf(NodeProperty);
        });


        it('composite key', function () {
            let attr: NodeProperty = (new NodeProperty("symbol"));
            expect(attr.isCompositeKey()).to.be.false;

            let ppt: NodeProperty = (new NodeProperty("symbol")).key(DbKeyType.FOREIGN);
            expect(ppt.isCompositeKey()).to.be.false;

            let ppt2: NodeProperty = (new NodeProperty("symbol")).key(DbKeyType.COMPOSITE, 1);
            expect(ppt2.isCompositeKey()).to.be.true;

            let ppt3: NodeProperty = (new NodeProperty("symbol")).key(DbKeyType.PRIMARY);
            expect(ppt3.isCompositeKey()).to.be.false;

            expect(ppt2).to.be.instanceOf(NodeProperty);
        });


        it('is chainable', function () {
            let ppt: NodeProperty = (new NodeProperty("symbol")).key(DbKeyType.PRIMARY);
            expect(ppt).to.be.instanceOf(NodeProperty);
        });
    });

    describe('serialize', function () {


        class HookMessage{

            static TYPE:NodeType = new NodeType( "runtime_evt", 12,
                [
                    (new NodeProperty("id")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
                    (new NodeProperty("type")).type(DbDataType.STRING).def(null),
                    (new NodeProperty("_s")).type(DbDataType.BOOLEAN).def(true),
                    (new NodeProperty("raw"))
                        .type(DbDataType.STRING)
                        .sleep( (x:NodePropertyState)=>{
                            if(x.p != null){
                                return JSON.stringify(x.p.toJsonObject());
                            }else{
                                return null;
                            }
                        })
                        .wakeUp( (x:NodePropertyState)=>{
                            switch (x.self.type){
                                case 1:
                                default:
                                    return JSON.parse(x.p);
                                    break;
                            }
                            return (x.p!=null ? JSON.parse(x.p) : null)
                        })
                        .def(null),
                    (new NodeProperty("node"))
                        .type(DbDataType.STRING)
                        .sleep( (x:NodePropertyState)=>{
                            //const t = Object.keys(x.p);
                            const t = [];
                            // transform a list of INode to a list of Node UID+type
                            x.p.map( n => t.push({ __:n.__, uid:n.getUID() }));
                            return JSON.stringify(t);
                        })
                        .wakeUp( (x:NodePropertyState)=>{
                            return (x.p!=null ? JSON.parse(x.p) : null)
                        })
                        .def("[]"),
                    (new NodeProperty("tags"))
                        .type(DbDataType.STRING)
                        .sleep( (x:NodePropertyState)=>{
                            //const t = Object.keys(x.p);
                            return JSON.stringify(x.p);
                        })
                        .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : null)})
                        .def("[]")
                ]);
            __:NodeInternalType = 12;

            type:number = null;

            id:any = null;

            raw: any = null;

            node: INode[] = [];

            tags: number[] = [];

            /**
             * Save flag. FALSE = not saved
             */
            _s = false;

            constructor(pConfig: any) {

                for (const i in this) {
                    this[i] = pConfig[i];
                }
            }
        }

        /**
         * @class
         */
        class HookSession {
            static TYPE: NodeType = new NodeType("hook_session", 11,
                [
                    (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
                    (new NodeProperty("message")).multiple(HookMessage.TYPE).def("[]"),
                    (new NodeProperty("hookManager")).volatile(),
                    (new NodeProperty("sets_matches")).volatile().def(null),
                    (new NodeProperty("time")).type(DbDataType.NUMERIC).def(-1),
                    (new NodeProperty("frida"))
                        .type(DbDataType.STRING)
                        .sleep((x: NodePropertyState) => {
                            if (x.p == null) return {};

                            return JSON.stringify({
                                pid: x.p.pid,
                                session: null,
                                device: null,
                                script: null
                            });
                        })
                        .wakeUp((x: NodePropertyState) => {
                            return (x.p != null ? JSON.parse(x.p) : null);
                        })
                        .def(0),
                    (new NodeProperty("active")).type(DbDataType.BOOLEAN).def(false),
                    (new NodeProperty("opts")).type(DbDataType.STRING).serialize(DbSerialize.JSON).def({}),
                    (new NodeProperty("offset")).type(DbDataType.NUMERIC).def(0),
                    (new NodeProperty("evTags"))
                        .type(DbDataType.STRING)
                        .sleep((x: NodePropertyState) => {
                            //const t = Object.keys(x.p);
                            return JSON.stringify(Object.keys(x.p));
                        })
                        .wakeUp((x: NodePropertyState) => {
                            return (x.p != null ? JSON.parse(x.p) : null)
                        })
                        .def(0)
                ]);
            __: NodeInternalType = 11;

            public _uid: string = null;

            /**
             * The stack containing the received message
             * @field
             */
            message: HookMessage[] = [];
            //message:HookMessageV2[] = [];

            /**
             * The associated HookManager
             * (TODO : 1 hookManager per device)
             * @field
             */
            hookManager: any = null;

            /**
             * Follow hookset matches
             * @field
             */
            sets_matches: any = {};

            /**
             * The timestamp of the session
             * @field
             */
            time: number = -1;

            /**
             * To hold some references from frida-node
             * @field
             */
            frida: any = null


            active = true;

            opts: any;

            evTags: any = {};

            tags = [];

            offset = 0;

            /**
             *
             * @param {HookManager} manager
             * @constructor
             */
            constructor(manager: any) {

                // not enough unique for collaborative mode
                // should be bound to the device also
                const now = (new Date()).getTime();

                this._uid = now + "";

                // hook
                this.message = [];
                this.hookManager = manager;
                this.sets_matches = {};
                this.time = now;
                this.frida = {
                    session: null,
                    device: null,
                    script: null,
                    pid: null
                };
                this.opts = {
                    rawOutput: false
                }
            }
        }


        it('sleep', function () {
            let sess = new HookSession({});
            sess.frida.pid = 123;
            sess.message.push(new HookMessage({id: "msg1", type: "runtime", tags: [1, 2, 3]}));
            sess.message.push(new HookMessage({id: "msg2", type: "runtime", tags: []}));
            sess.message.push(new HookMessage({id: "msg3", type: "runtime", tags: [2]}));


            expect(HookSession.TYPE.getProperty("message").hasSleep()).to.be.false;
            expect(HookSession.TYPE.getProperty("frida").hasSleep()).to.be.true;
            expect(HookSession.TYPE.getProperty("time").hasSleep()).to.be.false;

            const msgPpt = HookSession.TYPE.getProperty("message");
            const tagsPpt = HookMessage.TYPE.getProperty("tags");
            const fridaPpt = HookSession.TYPE.getProperty("frida");

            const obj = tagsPpt.doSleep({ p:sess.message[0][tagsPpt.getName()], self:sess.message[0] });
            expect( obj).to.be.equal("[1,2,3]");

        });

        it('serialize', function () {
            let sess = new HookSession({});
            sess.frida.pid = 123;
            sess.message.push(new HookMessage({ id:"msg1", type: "runtime", tags:[1,2,3] }));
            sess.message.push(new HookMessage({ id:"msg2", type: "runtime", tags:[] }));
            sess.message.push(new HookMessage({ id:"msg3", type: "runtime", tags:[2] }));


            expect(HookSession.TYPE.getProperty("opts").isSerialized()).to.be.true;
            expect(HookSession.TYPE.getProperty("opts").getSerializeMethod()).to.be.equal(DbSerialize.JSON);
        });

    });



    describe('toJsonObject', function () {

        it('should export NodeProperty definition with all fields', function () {
            const ppt = new NodeProperty("testProp")
                .type(DbDataType.STRING)
                .size(255)
                .key(DbKeyType.PRIMARY)
                .notnull()
                .def("default_value")
                .serialize(DbSerialize.JSON)
                .unique()
                .volatile();

            const obj = ppt.toJsonObject();

            expect(obj.name).to.equal("testProp");
            expect(obj.type).to.equal(DbDataType.STRING);
            expect(obj.size).to.equal(255);
            expect(obj.keyType).to.equal(DbKeyType.PRIMARY);
            expect(obj.composedKeyPart).to.equal(0);
            expect(obj.isIndex).to.equal(false);
            expect(obj.notNull).to.equal(true);
            expect(obj.defaultValue).to.equal("default_value");
            expect(obj.serializeFormat).to.equal(DbSerialize.JSON);
            expect(obj.nodeType).to.equal(null);
            expect(obj.volatile).to.equal(true);
            expect(obj.unique).to.equal(true);
            expect(obj.isMultiple).to.equal(false);
            expect(obj.isEmbedded).to.equal(false);
            expect(obj.nodeRefPpt).to.equal(null);
            expect(obj.foreignKeyName).to.equal(null);
            expect(obj.source).to.equal(null);
            expect(obj.validate).to.be.an('array').that.is.empty;
            expect(obj.sleepHook).to.equal(false);
            expect(obj.wakeupHook).to.equal(false);
        });

        it('should export NodeProperty with node type reference', function () {
            const nodeType = new NodeType("hook_session", 11, [
                (new NodeProperty("_uid")).type(DbDataType.INTEGER).key(DbKeyType.PRIMARY)
            ]);

            const ppt = new NodeProperty("session")
                .single(nodeType, "session_ref")
                .def(null);

            const obj = ppt.toJsonObject();

            expect(obj.name).to.equal("session");
            expect(obj.nodeType).to.equal("hook_session");
            expect(obj.nodeRefPpt).to.equal("session_ref");
            expect(obj.isMultiple).to.equal(false);
        });

        it('should export NodeProperty with multiple nodes', function () {
            const messageType = new NodeType("message", 12, [
                (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY)
            ]);

            const ppt = new NodeProperty("messages")
                .multiple(messageType, "session_id")
                .embed();

            const obj = ppt.toJsonObject();

            expect(obj.name).to.equal("messages");
            expect(obj.nodeType).to.equal("message");
            expect(obj.isMultiple).to.equal(true);
            expect(obj.isEmbedded).to.equal(true);
            expect(obj.foreignKeyName).to.equal("session_id");
        });

        it('should export NodeProperty with sleep and wakeup hooks', function () {
            const ppt = new NodeProperty("tags")
                .type(DbDataType.STRING)
                .sleep((x: NodePropertyState) => {
                    return JSON.stringify(x.p);
                })
                .wakeUp((x: NodePropertyState) => {
                    return (x.p != null ? JSON.parse(x.p) : null);
                })
                .def("[]");

            const obj = ppt.toJsonObject();

            expect(obj.name).to.equal("tags");
            expect(obj.sleepHook).to.equal(true);
            expect(obj.wakeupHook).to.equal(true);
            expect(obj.defaultValue).to.equal("[]");
        });

        it('should export NodeProperty with composite key', function () {
            const ppt = new NodeProperty("date")
                .type(DbDataType.STRING)
                .key(DbKeyType.COMPOSITE, 2);

            const obj = ppt.toJsonObject();

            expect(obj.name).to.equal("date");
            expect(obj.keyType).to.equal(DbKeyType.COMPOSITE);
            expect(obj.composedKeyPart).to.equal(2);
        });

        it('should export NodeProperty with validation rules', function () {
            const rule1 = {
                test: (val: any) => val.length > 0,
                toJsonObject: () => ({ type: "length", min: 1 })
            };
            const rule2 = {
                test: (val: any) => val.length < 100,
                toJsonObject: () => ({ type: "length", max: 100 })
            };

            const ppt = new NodeProperty("name")
                .type(DbDataType.STRING)
                .addValidationRule(rule1 as any)
                .addValidationRule(rule2 as any);

            const obj = ppt.toJsonObject();

            expect(obj.name).to.equal("name");
            expect(obj.validate).to.be.an('array').with.lengthOf(2);
            expect(obj.validate[0].type).to.equal("length");
            expect(obj.validate[0].min).to.equal(1);
            expect(obj.validate[1].max).to.equal(100);
        });

        it('should export minimal NodeProperty with defaults', function () {
            const ppt = new NodeProperty("simpleProp");

            const obj = ppt.toJsonObject();

            expect(obj.name).to.equal("simpleProp");
            expect(obj.type).to.equal(null);
            expect(obj.size).to.equal(-1);
            expect(obj.keyType).to.equal(null);
            expect(obj.volatile).to.equal(false);
            expect(obj.unique).to.equal(false);
            expect(obj.isMultiple).to.equal(false);
            expect(obj.isEmbedded).to.equal(false);
        });
    });


    describe('toArrayHeader', function () {

        it('should return all property names', function () {
            const header = NodeProperty.toArrayHeader();

            expect(header).to.have.members([
                "_name",
                "_type",
                "_size",
                "_key",
                "_k_p",
                "_idx",
                "_nnull",
                "_def",
                "_serialize",
                "_n",
                "_v",
                "_u",
                "_m",
                "_e",
                "_r",
                "_m_kn",
                "_src",
                "_val",
                "_s",
                "_wu",
                "_dscr"
            ]);
        });

        it('should return property names with additional fields', function () {
            const header = NodeProperty.toArrayHeader(["custom1", "custom2"]);

            expect(header).to.have.members([
                "_name",
                "_type",
                "_size",
                "_key",
                "_k_p",
                "_idx",
                "_nnull",
                "_def",
                "_serialize",
                "_n",
                "_v",
                "_u",
                "_m",
                "_e",
                "_r",
                "_m_kn",
                "_src",
                "_val",
                "_s",
                "_wu",
                "_dscr",
                "custom1",
                "custom2"
            ]);
        });
    });

    describe('toArrayValue', function () {

        it('should export values for subset of properties with NONE transform', function () {
            const ppt = new NodeProperty("testProp")
                .type(DbDataType.STRING)
                .size(255)
                .key(DbKeyType.PRIMARY)
                .notnull()
                .def("default_value")
                .unique();

            const values = ppt.toArrayValue([
                "_name",
                "_type",
                "_size",
                "_key"
            ], NodeTransform.NONE);

            expect(values[0]).to.equal("testProp");
            expect(values[1]).to.equal(DbDataType.STRING);
            expect(values[2]).to.equal(255);
            expect(values[3]).to.equal(DbKeyType.PRIMARY);
        });

        it('should export all properties with NONE transform', function () {
            const ppt = new NodeProperty("fullProp")
                .type(DbDataType.INTEGER)
                .size(11)
                .key(DbKeyType.FOREIGN, 1)
                .notnull()
                .def(100)
                .unique()
                .descr("Any text")
                .volatile();

            const header = NodeProperty.toArrayHeader();
            const values = ppt.toArrayValue(header, NodeTransform.NONE);

            expect(values[header.indexOf("_name")]).to.equal("fullProp");
            expect(values[header.indexOf("_type")]).to.equal(DbDataType.INTEGER);
            expect(values[header.indexOf("_size")]).to.equal(11);
            expect(values[header.indexOf("_key")]).to.equal(DbKeyType.FOREIGN);
            expect(values[header.indexOf("_k_p")]).to.equal(1);
            expect(values[header.indexOf("_nnull")]).to.equal(true);
            expect(values[header.indexOf("_def")]).to.equal(100);
            expect(values[header.indexOf("_v")]).to.equal(true);
            expect(values[header.indexOf("_u")]).to.equal(true);
            expect(values[header.indexOf("_dscr")]).to.equal("Any text");
        });

        it('should export validation rules with NONE transform', function () {
            const rule1 = {
                test: (val: any) => val.length > 0,
                toJsonObject: () => ({ type: "length", min: 1 })
            };

            const ppt = new NodeProperty("validatedProp")
                .type(DbDataType.STRING)
                .addValidationRule(rule1 as any);

            const values = ppt.toArrayValue(["_name", "_val"], NodeTransform.NONE);

            expect(values[0]).to.equal("validatedProp");
            expect(values[1]).to.be.an('array').with.lengthOf(1);
            expect(values[1][0]).to.equal(rule1);
        });


        it('should export validation rules with ARRAY transform', function () {
            const rule1 = {
                test: (val: any) => val.length > 0,
                toJsonObject: () => ({ type: "length", min: 1 })
            };

            const ppt = new NodeProperty("validatedProp")
                .type(DbDataType.STRING)
                .addValidationRule(rule1 as any);

            const values = ppt.toArrayValue(["_name", "_val"], NodeTransform.ARRAY);

            expect(values[0]).to.equal("validatedProp");
            expect(values[1]).to.be.an('array').with.lengthOf(1);
            expect(values[1][0]).to.equal(rule1);
        });

        it('should handle sleep and wakeup hooks with NONE transform', function () {
            const sleepFn = (x: NodePropertyState) => JSON.stringify(x.p);
            const wakeUpFn = (x: NodePropertyState) => JSON.parse(x.p);

            const ppt = new NodeProperty("hookProp")
                .type(DbDataType.STRING)
                .sleep(sleepFn)
                .wakeUp(wakeUpFn);

            const values = ppt.toArrayValue(["_name", "_s", "_wu"], NodeTransform.NONE);

            expect(values[0]).to.equal("hookProp");
            expect(values[1]).to.equal(sleepFn);
            expect(values[2]).to.equal(wakeUpFn);
        });

        it('should return null for hooks with JSON transform', function () {
            const sleepFn = (x: NodePropertyState) => JSON.stringify(x.p);
            const wakeUpFn = (x: NodePropertyState) => JSON.parse(x.p);

            const ppt = new NodeProperty("hookProp")
                .type(DbDataType.STRING)
                .sleep(sleepFn)
                .wakeUp(wakeUpFn);

            const values = ppt.toArrayValue(["_name", "_s", "_wu"], NodeTransform.JSON);

            expect(values[0]).to.equal("hookProp");
            expect(values[1]).to.equal(null);
            expect(values[2]).to.equal(null);
        });

        it('should return null for hooks with ARRAY transform', function () {
            const sleepFn = (x: NodePropertyState) => JSON.stringify(x.p);

            const ppt = new NodeProperty("hookProp")
                .type(DbDataType.STRING)
                .sleep(sleepFn);

            const values = ppt.toArrayValue(["_s"], NodeTransform.ARRAY);

            expect(values[0]).to.equal(null);
        });

        it('should export with node type reference', function () {
            const nodeType = new NodeType("referenced_node", 50, [
                (new NodeProperty("_uid")).type(DbDataType.INTEGER).key(DbKeyType.PRIMARY)
            ]);

            const ppt = new NodeProperty("refProp")
                .single(nodeType, "ref_property");

            const values = ppt.toArrayValue(["_name", "_n", "_r"], NodeTransform.NONE);

            expect(values[0]).to.equal("refProp");
            expect(values[1]).to.equal(50);
            expect(values[2]).to.equal("ref_property");
        });

        it('should export multiple node reference', function () {
            const nodeType = new NodeType("multiple_node", 51, [
                (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY)
            ]);

            const ppt = new NodeProperty("multiProp")
                .multiple(nodeType, "foreign_key_name")
                .embed();

            const values = ppt.toArrayValue(["_name", "_m", "_e", "_m_kn"], NodeTransform.NONE);

            expect(values[0]).to.equal("multiProp");
            expect(values[1]).to.equal(true);
            expect(values[2]).to.equal(true);
            expect(values[3]).to.equal("foreign_key_name");
        });

        it('should handle empty property list', function () {
            const ppt = new NodeProperty("emptyTest")
                .type(DbDataType.STRING);

            const values = ppt.toArrayValue([], NodeTransform.NONE);

            expect(values).to.be.an('array').that.is.empty;
        });

        it('should handle serialization format', function () {
            const ppt = new NodeProperty("serializedProp")
                .type(DbDataType.STRING)
                .serialize(DbSerialize.JSON);

            const values = ppt.toArrayValue(["_name", "_serialize"], NodeTransform.NONE);

            expect(values[0]).to.equal("serializedProp");
            expect(values[1]).to.equal(DbSerialize.JSON);
        });
    });



    describe('schema()', function () {
        it('should set a JSON schema and return NodeProperty for chaining', function () {
            const ppt = new NodeProperty("email");
            const schema = {
                type: 'string' as const,
                format: 'email',
                maxLength: 255
            };

            const result = ppt.schema(schema);

            expect(result).to.be.instanceOf(NodeProperty);
            expect(ppt._sc).to.deep.equal(schema);
        });

        it('should allow setting complex object schema', function () {
            const ppt = new NodeProperty("address");
            const schema = {
                type: 'object' as const,
                properties: {
                    street: {type: 'string' as const},
                    city: {type: 'string' as const},
                    zipCode: {type: 'string' as const, pattern: '^[0-9]{5}$'}
                },
                required: ['street', 'city']
            };

            ppt.schema(schema);

            expect(ppt._sc).to.deep.equal(schema);
            expect(ppt._sc.type).to.equal('object');
            expect(ppt._sc.properties).to.have.property('street');
        });

        it('should allow setting array schema', function () {
            const ppt = new NodeProperty("tags");
            const schema = {
                type: 'array' as const,
                items: {type: 'string' as const},
                uniqueItems: true,
                minItems: 1
            };

            ppt.schema(schema);

            expect(ppt._sc.type).to.equal('array');
            expect(ppt._sc.items).to.deep.equal({type: 'string'});
            expect(ppt._sc.uniqueItems).to.be.true;
        });

        it('should handle enum schema', function () {
            const ppt = new NodeProperty("status");
            const schema = {
                type: 'string' as const,
                enum: ['pending', 'approved', 'rejected']
            };

            ppt.schema(schema);

            expect(ppt._sc.enum).to.deep.equal(['pending', 'approved', 'rejected']);
        });

        it('should be chainable with other NodeProperty methods', function () {
            const ppt = new NodeProperty("email")
                .type(DbDataType.STRING)
                .notnull()
                .schema({
                    type: 'string' as const,
                    format: 'email'
                })
                .unique();

            expect(ppt).to.be.instanceOf(NodeProperty);
            expect(ppt.isNotNull()).to.be.true;
            expect(ppt.isUnique()).to.be.true;
            expect(ppt._sc.format).to.equal('email');
        });
    });

    describe('schemaDoc()', function () {
        it('should set a JSON schema document and return NodeProperty for chaining', function () {
            const ppt = new NodeProperty("user");
            const schemaDoc = {
                $schema: 'https://json-schema.org/draft/2020-12/schema',
                $id: 'https://example.com/user.schema.json',
                title: 'User',
                type: 'object' as const,
                properties: {
                    id: {type: 'integer' as const},
                    name: {type: 'string' as const}
                }
            };

            const result = ppt.schemaDoc(schemaDoc);

            expect(result).to.be.instanceOf(NodeProperty);
            expect(ppt._scd).to.deep.equal(schemaDoc);
        });

        it('should set schema document with $defs', function () {
            const ppt = new NodeProperty("config");
            const schemaDoc = {
                $schema: 'https://json-schema.org/draft/2020-12/schema',
                type: 'object' as const,
                $defs: {
                    address: {
                        type: 'object' as const,
                        properties: {
                            street: {type: 'string' as const}
                        }
                    }
                },
                properties: {
                    home: {$ref: '#/$defs/address'}
                }
            };

            ppt.schemaDoc(schemaDoc);

            expect(ppt._scd.$defs).to.exist;
            expect(ppt._scd.$defs.address).to.exist;
        });

        it('should be chainable', function () {
            const ppt = new NodeProperty("data")
                .type(DbDataType.BLOB)
                .schemaDoc({
                    $schema: 'https://json-schema.org/draft/2020-12/schema',
                    type: 'object' as const
                })
                .def({});

            expect(ppt).to.be.instanceOf(NodeProperty);
            expect(ppt.getDefaultValue()).to.deep.equal({});
        });
    });

    describe('toJSONSchemaDoc()', function () {
        it('should return null when no schema document is set', function () {
            const ppt = new NodeProperty("test");

            const result = ppt.toJSONSchemaDoc();

            expect(result).to.be.null;
        });

        it('should return the schema document when set', function () {
            const ppt = new NodeProperty("user");
            const schemaDoc = {
                $schema: 'https://json-schema.org/draft/2020-12/schema',
                $id: 'https://example.com/user.schema.json',
                title: 'User',
                type: 'object' as const,
                properties: {
                    id: {type: 'integer' as const}
                }
            };

            ppt.schemaDoc(schemaDoc);
            const result = ppt.toJSONSchemaDoc();

            expect(result).to.deep.equal(schemaDoc);
            expect(result.$schema).to.equal('https://json-schema.org/draft/2020-12/schema');
            expect(result.$id).to.equal('https://example.com/user.schema.json');
        });

        it('should return exact schema document that was set', function () {
            const ppt = new NodeProperty("product");
            const schemaDoc = {
                $schema: 'https://json-schema.org/draft/2020-12/schema',
                title: 'Product',
                type: 'object' as const,
                properties: {
                    name: {type: 'string' as const},
                    price: {type: 'number' as const, minimum: 0}
                },
                required: ['name', 'price']
            };

            ppt.schemaDoc(schemaDoc);

            expect(ppt.toJSONSchemaDoc()).to.deep.equal(schemaDoc);
        });
    });
    describe('toJSONSchemaPart()', function () {
        it('should return null when no schema is set', function () {
            const ppt = new NodeProperty("test");

            const result = ppt.toJSONSchemaPart();

            expect(result).to.be.null;
        });

        it('should return the schema when set and pIsArray is false', function () {
            const ppt = new NodeProperty("email");
            const schema = {
                type: 'string' as const,
                format: 'email',
                maxLength: 255
            };

            ppt.schema(schema);
            const result = ppt.toJSONSchemaPart(false);

            expect(result).to.deep.equal(schema);
            expect(result.type).to.equal('string');
        });

        it('should wrap schema in array type when pIsArray is true', function () {
            const ppt = new NodeProperty("email");
            const schema = {
                type: 'string' as const,
                format: 'email'
            };

            ppt.schema(schema);
            const result = ppt.toJSONSchemaPart(true);

            expect(result.type).to.equal('array');
            expect(result.items).to.deep.equal(schema);
        });

        it('should wrap object schema in array when pIsArray is true', function () {
            const ppt = new NodeProperty("users");
            const schema = {
                type: 'object' as const,
                properties: {
                    id: {type: 'integer' as const},
                    name: {type: 'string' as const}
                }
            };

            ppt.schema(schema);
            const result = ppt.toJSONSchemaPart(true);

            expect(result.type).to.equal('array');
            expect(result.items).to.deep.equal(schema);
            expect(result.items.type).to.equal('object');
        });

        it('should handle complex nested schema', function () {
            const ppt = new NodeProperty("address");
            const schema = {
                type: 'object' as const,
                properties: {
                    street: {type: 'string' as const},
                    coordinates: {
                        type: 'object' as const,
                        properties: {
                            lat: {type: 'number' as const},
                            lng: {type: 'number' as const}
                        }
                    }
                }
            };

            ppt.schema(schema);
            const result = ppt.toJSONSchemaPart(false);

            expect(result).to.deep.equal(schema);
            expect(result.properties.coordinates.properties).to.exist;
        });

        it('should default to pIsArray=false when not specified', function () {
            const ppt = new NodeProperty("status");
            const schema = {
                type: 'string' as const,
                enum: ['active', 'inactive']
            };

            ppt.schema(schema);
            const result = ppt.toJSONSchemaPart();

            expect(result).to.deep.equal(schema);
            expect(result.type).to.equal('string');
        });

        it('should handle schema with validation keywords', function () {
            const ppt = new NodeProperty("age");
            const schema = {
                type: 'integer' as const,
                minimum: 0,
                maximum: 150,
                description: 'Person age in years'
            };

            ppt.schema(schema);
            const result = ppt.toJSONSchemaPart();

            expect(result.minimum).to.equal(0);
            expect(result.maximum).to.equal(150);
            expect(result.description).to.equal('Person age in years');
        });

        it('should handle schema with oneOf', function () {
            const ppt = new NodeProperty("value");
            const schema = {
                oneOf: [
                    {type: 'string' as const},
                    {type: 'number' as const}
                ]
            };

            ppt.schema(schema);
            const result = ppt.toJSONSchemaPart();

            expect(result.oneOf).to.be.an('array').with.lengthOf(2);
            expect(result.oneOf[0].type).to.equal('string');
            expect(result.oneOf[1].type).to.equal('number');
        });

        it('should handle schema with $ref', function () {
            const ppt = new NodeProperty("reference");
            const schema = {
                $ref: '#/$defs/commonType'
            };

            ppt.schema(schema);
            const result = ppt.toJSONSchemaPart();

            expect(result.$ref).to.equal('#/$defs/commonType');
        });

        it('should handle array schema wrapped in array', function () {
            const ppt = new NodeProperty("matrix");
            const schema = {
                type: 'array' as const,
                items: {type: 'number' as const}
            };

            ppt.schema(schema);
            const result = ppt.toJSONSchemaPart(true);

            expect(result.type).to.equal('array');
            expect(result.items).to.deep.equal(schema);
            expect(result.items.type).to.equal('array');
        });

        it('should preserve all schema properties when wrapping in array', function () {
            const ppt = new NodeProperty("product");
            const schema = {
                type: 'object' as const,
                title: 'Product',
                description: 'A product item',
                properties: {
                    sku: {type: 'string' as const},
                    price: {type: 'number' as const}
                },
                required: ['sku']
            };

            ppt.schema(schema);
            const result = ppt.toJSONSchemaPart(true);

            expect(result.type).to.equal('array');
            expect(result.items).to.deep.equal(schema);
            expect(result.items.title).to.equal('Product');
            expect(result.items.required).to.deep.equal(['sku']);
        });
    });

    describe('integration: schema with other NodeProperty features', function () {
        it('should combine schema with data type', function () {
            const ppt = new NodeProperty("email")
                .type(DbDataType.STRING)
                .schema({
                    type: 'string' as const,
                    format: 'email'
                });

            expect(ppt.getType()).to.equal(DbDataType.STRING);
            expect(ppt._sc.format).to.equal('email');
        });

        it('should combine schema with validation rules', function () {
            const rule = {
                test: (val: any) => val.length > 0,
                toJsonObject: () => ({type: "length", min: 1})
            };

            const ppt = new NodeProperty("username")
                .type(DbDataType.STRING)
                .addValidationRule(rule as any)
                .schema({
                    type: 'string' as const,
                    minLength: 3,
                    maxLength: 20
                });

            expect(ppt.isSanitizable()).to.be.true;
            expect(ppt._sc.minLength).to.equal(3);
        });

        it('should combine schema with default value', function () {
            const ppt = new NodeProperty("status")
                .def('pending')
                .schema({
                    type: 'string' as const,
                    enum: ['pending', 'approved', 'rejected']
                });

            expect(ppt.getDefaultValue()).to.equal('pending');
            expect(ppt._sc.enum).to.include('pending');
        });

        it('should work with node type references', function () {
            const refType = new NodeType("referenced", 99, [
                (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY)
            ]);

            const ppt = new NodeProperty("reference")
                .single(refType)
                .schema({
                    type: 'object' as const,
                    properties: {
                        _uid: {type: 'string' as const}
                    }
                });

            expect(ppt.isNode()).to.be.true;
            expect(ppt._sc.type).to.equal('object');
        });

        it('should support schema with serialization', function () {
            const ppt = new NodeProperty("config")
                .type(DbDataType.BLOB)
                .serialize(DbSerialize.JSON)
                .schema({
                    type: 'object' as const,
                    additionalProperties: true
                });

            expect(ppt.isSerialized()).to.be.true;
            expect(ppt._sc.additionalProperties).to.be.true;
        });

        it('should handle schema with unique constraint', function () {
            const ppt = new NodeProperty("email")
                .type(DbDataType.STRING)
                .unique()
                .notnull()
                .schema({
                    type: 'string' as const,
                    format: 'email'
                });

            expect(ppt.isUnique()).to.be.true;
            expect(ppt.isNotNull()).to.be.true;
            expect(ppt._sc.format).to.equal('email');
        });
    });

    describe('checkSchema()', function () {


        it('should return the schema document when set', function () {
            const ppt = new NodeProperty("user");
            const schemaDoc = {
                $schema: 'https://json-schema.org/draft/2020-12/schema',
                $id: 'https://example.com/user.schema.json',
                title: 'User',
                type: 'object' as const,
                properties: {
                    id: {type: 'integer' as const}
                }
            };

            ppt.schemaDoc(schemaDoc);


            const result = ppt.checkSchema({
                id: 12
            });

            expect(result.valid).to.equal(true);
        });

    });
});