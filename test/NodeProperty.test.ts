import {expect} from "chai";
import {NodeProperty, NodePropertyState} from "../src/NodeProperty.js";
import {DbDataType, DbKeyType, DbSerialize} from "../src/DbAbstraction.js";
import {NodeType} from "../src/NodeType.js";
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

            node:INode[] = [];

            tags:number[] = [];

            /**
             * Save flag. FALSE = not saved
             */
            _s = false;

            constructor( pConfig:any) {

                for(const i in this){
                    this[i] = pConfig[i];
                }
            }
        }
        /**
         * @class
         */
        class HookSession {
            static TYPE:NodeType = new NodeType( "hook_session", 11,
                [
                    (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
                    (new NodeProperty("message")).multiple(HookMessage.TYPE).def("[]"),
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
                    (new NodeProperty("opts")).type(DbDataType.STRING).serialize(DbSerialize.JSON).def({}),
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
            __:NodeInternalType = 11;

            public _uid:string = null;

            /**
             * The stack containing the received message
             * @field
             */
            message:HookMessage[] = [];
            //message:HookMessageV2[] = [];

            /**
             * The associated HookManager
             * (TODO : 1 hookManager per device)
             * @field
             */
            hookManager:any = null;

            /**
             * Follow hookset matches
             * @field
             */
            sets_matches:any = {};

            /**
             * The timestamp of the session
             * @field
             */
            time:number = -1;

            /**
             * To hold some references from frida-node
             * @field
             */
            frida:any = null


            active = true;

            opts:any;

            evTags:any = {};

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
                const now =  (new Date()).getTime();

                this._uid = now+"";

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
            sess.message.push(new HookMessage({ id:"msg1", type: "runtime", tags:[1,2,3] }));
            sess.message.push(new HookMessage({ id:"msg2", type: "runtime", tags:[] }));
            sess.message.push(new HookMessage({ id:"msg3", type: "runtime", tags:[2] }));


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

});