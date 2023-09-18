import {expect} from "chai";
import {ConnectorFactory} from "../src/ConnectorFactory.js";
import {IDatabaseAdapter, IDbCollection} from "../src/DbAbstraction";
import {NodeType} from "../src/NodeType";
import InMemoryConnector from "./connectors/inmemory/InMemoryConnector";
import {InMemoryDb} from "./connectors/inmemory/InMemoryDb";
import {AppContextType, IAppContext} from "../src/IAppContext";

describe('ConnectorFactory', function() {

    describe('constructor', function () {

        it('new factory, default settings', function () {
            let factory: ConnectorFactory = new ConnectorFactory();
            expect(factory).to.be.instanceOf(ConnectorFactory);
        });
    });

    describe('addAdapter', function () {

        it('new factory, default settings', function () {
            let factory: ConnectorFactory = new ConnectorFactory();
            factory.addAdapter(InMemoryConnector,"inmemory");
            factory.addAdapter(InMemoryConnector,"cache");
            class Project implements IAppContext {
                _type = AppContextType.WEB_SERVER;
                name = "-";
            }
            const connector = factory.newConnector("inmemory", new Project())
            expect(connector).to.be.instanceOf(InMemoryConnector);
            expect((connector as InMemoryConnector).type).to.be.equal(InMemoryConnector.UUID);
        });
    });


    describe('newConnector', function () {

        it('new factory, default settings', function () {
            let factory: ConnectorFactory = new ConnectorFactory();
            factory.addAdapter(InMemoryConnector,"inmemory");
            factory.addAdapter(InMemoryConnector,"cache");
            class Project implements IAppContext {
                _type = AppContextType.WEB_SERVER;
                name = "-";
            }
            const connector = factory.newConnector("inmemory", new Project())
            expect(connector).to.be.instanceOf(InMemoryConnector);
            expect((connector as InMemoryConnector).type).to.be.equal(InMemoryConnector.UUID);
        });
    });

});