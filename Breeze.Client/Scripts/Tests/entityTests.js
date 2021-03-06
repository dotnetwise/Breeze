require.config({ baseUrl: "Scripts/IBlade" });

define(["testFns"], function (testFns) {
    var breeze = testFns.breeze;
    var core = breeze.core;
    
    var Enum = core.Enum;
    var Event = core.Event;

    var MetadataStore = breeze.MetadataStore;
    var EntityManager = breeze.EntityManager;
    var EntityQuery = breeze.EntityQuery;
    var EntityKey = breeze.EntityKey;
    var DataType = breeze.DataType;
    var newEm = testFns.newEm;
    var newMs = testFns.newMs;
    
    module("entity", {
        setup: function () {
            breeze.DataType.DateTime.defaultValue = new Date(2000, 0, 1);
            testFns.setup();
        },
        teardown: function () {

        }
    });
    
    test("set foreign key property to null", function () {
        var productQuery = new EntityQuery("Products").take(1)
            .expand("supplier");

        stop();
        var em = newEm();
        em.executeQuery(productQuery)
            .then(assertProductSetSupplierIDToNull)
            .fail(testFns.handleFail)
            .fin(start);
    });

    function assertProductSetSupplierIDToNull(data) {
        var products = data.results;
        var firstProduct = products[0];

        ok(firstProduct.getProperty("supplierID"), "SupplierID should not be null" );

        firstProduct.setProperty("supplierID", null);

        ok(firstProduct.getProperty("supplierID") == null, "is SupplierID null?");
    }

    test("null foriegn key", function() {
        var em = newEm();
        var productType = em.metadataStore.getEntityType("Product");
        var product = productType.createEntity();
        em.attachEntity(product);
        product.setProperty('supplierID', null);
        var errs = product.entityAspect.getValidationErrors();
        var q = EntityQuery.from("Products").take(1);
        em.executeQuery(q).then(function(data) {
            var products = data.results;
            product = products[0];
            product.setProperty('supplierID', null);
            errs = product.entityAspect.getValidationErrors();
        });
        ok(true);

        //Set product's SupplierID value to null
        //Set product's Supplier to null
        //Set product's SupplierID to 0

    });
    
    // TODO: finish this
    //test("datatype coercion - boolean - custom conversion", function () {
    //    var em = newEm(); // new empty EntityManager
    //    var oldFn = DataType.Boolean.parse;
    //    var newFn = function(source, sourceTypeName) {
            
    //        if (sourceTypeName === "string") {
    //            var src = source.trim().toLowerCase();
    //            if (src === 'false') {
    //                return false;
    //            } else if (src === "true") {
    //                return true;
    //            } else {
    //                return source;
    //            }
    //        } else {
    //            return oldFn(source, sourceTypeName);
    //        }
    //    };
    //    DataType.Boolean.parse = newFn;
        
    //});
    
    test("datatype coercion - null strings to empty strings", function () {
        var em = newEm(); // new empty EntityManager
        var oldFn = DataType.String.parse;
        var newFn = function (source, sourceTypeName) {
            if (source == null) {
                return "";
            } else if (sourceTypeName === "string") {
                return source.trim();
            } else {
                return source.toString();
            }
        };
        DataType.String.parse = newFn;
        try {
            var aType = em.metadataStore.getEntityType("Customer");
            // OrderID, UnitPrice, Discount
            var inst = aType.createEntity();
            var val;
            inst.setProperty("companyName", null);
            val = inst.getProperty("companyName");
            ok(val === "");

            inst.setProperty("companyName", undefined);
            val = inst.getProperty("companyName");
            ok(val === "");

            inst.setProperty("companyName", "    now is the time    ");
            val = inst.getProperty("companyName");
            ok(val === "now is the time");
        } finally {
            DataType.String.parse = oldFn;
        }
    });


    test("datatype coercion - date", function() {
        var em = newEm(); // new empty EntityManager
        var userType = em.metadataStore.getEntityType("User");

        var user = userType.createEntity();
        var dt = new Date(2000, 2, 15); // 2 => 3 below because date ctor is 0 origin on months.
        user.setProperty("createdDate", "3/15/2000");
        var sameDt = user.getProperty("createdDate");
        ok(dt.getTime() === sameDt.getTime());
        user.setProperty("modifiedDate", dt.getTime());
        var sameDt2 = user.getProperty("modifiedDate");
        ok(dt.getTime() === sameDt2.getTime());

    });
    
    test("datatype coercion - integer", function () {
        var em = newEm(); // new empty EntityManager
        var odType = em.metadataStore.getEntityType("OrderDetail");
        // OrderID, UnitPrice, Discount
        var od = odType.createEntity();
        var val;
        od.setProperty("orderID", "3.4");
        val = od.getProperty("orderID");
        ok(val === 3);

        od.setProperty("orderID", 3.4);
        val = od.getProperty("orderID");
        ok(val === 3);
        


    });
    
    test("datatype coercion - decimal", function () {
        var em = newEm(); // new empty EntityManager
        var odType = em.metadataStore.getEntityType("OrderDetail");
        // OrderID, UnitPrice, Discount
        var od = odType.createEntity();
        var val;
        od.setProperty("unitPrice", "3.4");
        val = od.getProperty("unitPrice");
        ok(val === 3.4);
        
        od.setProperty("unitPrice", "3");
        val = od.getProperty("unitPrice");
        ok(val === 3);

        od.setProperty("unitPrice", 3.4);
        val = od.getProperty("unitPrice");
        ok(val === 3.4);

    });
    
    test("datatype coercion - float", function () {
        var em = newEm(); // new empty EntityManager
        var odType = em.metadataStore.getEntityType("OrderDetail");
        // OrderID, UnitPrice, Discount
        var od = odType.createEntity();
        var val;
        od.setProperty("discount", "3.4");
        val = od.getProperty("discount");
        ok(val === 3.4);

        od.setProperty("discount", "3");
        val = od.getProperty("discount");
        ok(val === 3);

        od.setProperty("discount", 3.4);
        val = od.getProperty("discount");
        ok(val === 3.4);

    });



    
    test("create entity with non-null dates", function() {
        var em = newEm(); // new empty EntityManager
        var userType = em.metadataStore.getEntityType("User");
        
        var user = userType.createEntity();

        var crtnDate = user.getProperty("createdDate");
        var modDate = user.getProperty("modifiedDate");
        ok(core.isDate(crtnDate), "crtnDate is not a date");
        ok(core.isDate(modDate), "modDate is not a date");
        em.addEntity(user);
        // need to do this after the addEntity call
        var id = user.getProperty("id");
        var exported = em.exportEntities();
        var em2 = newEm();
        em2.importEntities(exported);
        var user2 = em2.getEntityByKey("User", id);
        var crtnDate2 = user2.getProperty("createdDate");
        var modDate2 = user2.getProperty("modifiedDate");
        ok(core.isDate(crtnDate2), "crtnDate2 is not a date");
        ok(core.isDate(modDate2), "modDate2 is not a date");
        ok(crtnDate2.getTime() == crtnDate.getTime(), "crtn dates are not equal");
        ok(modDate2.getTime() == modDate.getTime(), "mod dates are not equal");
    });
    
    

    test("multipart foreign keys", function() {
        var em = newEm(); // new empty EntityManager
        var bodType = em.metadataStore.getEntityType("BonusOrderDetailItem");
        stop();
        EntityQuery.from("OrderDetails").take(1).using(em).execute().then(function(data) {
            var orderDetail = data.results[0];
            var bod = bodType.createEntity();
            bod.setProperty("bonusOrderDetailItemID", core.getUuid());
            bod.setProperty("orderDetail", orderDetail);
            var orderId = bod.getProperty("orderID");
            ok(orderId === orderDetail.getProperty("orderID"), "orderId's should be the same");
            var productId = bod.getProperty("productID");
            ok(productId === orderDetail.getProperty("productID"), "productId's should be the same");
        }).fail(testFns.handleFail).fin(start);


    });

    test("create entity with initial properties", function() {
        var em = newEm(); // new empty EntityManager
        var empType = em.metadataStore.getEntityType("Employee");

        var employee = empType.createEntity({
            firstName: "John",
            lastName: "Smith",
            employeeID: 42
        });
        ok(employee.getProperty("firstName") === "John", "first name should be 'John'");
        ok(employee.getProperty("employeeID") === 42, "employeeID should be 42");
        try {
            var badEmp = empType.createEntity({
                firstxame: "John",
                lastName: "Smith",
                employeeID: 42,
            });
            ok(false, "shouldn't get here");
        } catch(e) {
            ok(e.message.indexOf("firstxame") !== -1, "error should mention 'firstxame'");
        }
    });
    
    test("acceptChanges - detach deleted", 1, function () {

        var em = newEm(); // new empty EntityManager
        var empType = em.metadataStore.getEntityType("Employee");

        var employee = empType.createEntity(); // created but not attached
        employee.setProperty("employeeID", 42);
        em.attachEntity(employee); // simulate existing employee

        employee.entityAspect.setDeleted();
        employee.entityAspect.acceptChanges(); // simulate post-save state
        //em.acceptChanges(); // this works too ... for all changed entities in cache

        ok(employee.entityAspect.entityState.isDetached(),
            'employee should be "Detached" after calling acceptChanges');
    });

    test("rejectChanges notification", function() {
        //1) attach propertyChangedHandler to an existing entity
        //2) modify entity (handler hears it, and reports that the entity is "Modified")
        //3) entity.entityAspect.rejectChanges()
        //4) handler hears it ... but reports "Modified" rather than "Unchanged"
        var em = newEm();

        var orderType = em.metadataStore.getEntityType("Order");
        var order = orderType.createEntity();
        order.setProperty("orderID", 1);
        em.attachEntity(order);
        var es;
        var count = 0;
        var lastArgs;
        var entity;
        order.entityAspect.propertyChanged.subscribe(function (args) {
            count++;
            lastArgs = args;
        });
        order.setProperty("freight", 55.55);
        ok(count === 1, "count should be 1");
        ok(lastArgs.entity === order, "entity should be order");
        ok(lastArgs.propertyName === "freight", "property name should be 'freight'");
        ok(lastArgs.entity.entityAspect.entityState.isModified(), "entityState should be modified");
        order.entityAspect.rejectChanges();
        ok(count === 2, "count should be 2");
        ok(lastArgs.entity === order, "entity should be order");
        ok(lastArgs.propertyName === null, "property name should be null");
        ok(lastArgs.entity.entityAspect.entityState.isUnchanged(), "entityState should be unchanged");

    });
    
    test("rejectChanges of a child entity restores it to its parent", 8, function () {
        var em = newEm();

        var orderType = em.metadataStore.getEntityType("Order");
        var parent = orderType.createEntity();
        parent.setProperty("orderID",1);
        em.attachEntity(parent);

        var orderDetailType = em.metadataStore.getEntityType("OrderDetail");
        var child = orderDetailType.createEntity();
        child.setProperty("orderID", 42);
        child.setProperty("order", parent); // adds child to parent's manager
        child.entityAspect.setUnchanged();

        // parent and child are now unchanged ... as if freshly queried
        ok(!em.hasChanges(),
            "manager should not have unsaved changes before delete");

        child.entityAspect.setDeleted();

        equal(parent.getProperty("orderID"), child.getProperty("orderID"),
            "child's still has parent's FK Id after delete");
        ok(null === child.getProperty("order"), // Bug? Should deleted child still have parent?
            "deleted child cannot navigate to former parent after delete");
        equal(parent.getProperty("orderDetails").length, 0,
            "parent no longer has the chile after child delete");

        em.rejectChanges();

        ok(!em.hasChanges(),
            "manager should not have unsaved changes after rejectChanges");
        equal(parent.getProperty("orderID"), child.getProperty("orderID"),
            "child's still has parent's FK Id after rejectChanges");
        ok(parent === child.getProperty("order"),
            "child can navigate to parent after rejectChanges");
        ok(parent.getProperty("orderDetails")[0] === child,
            "parent has child after rejectChanges");
    });


    test("custom Customer type with createEntity", function() {
        var em = newEm(newMs());

        var Customer = testFns.models.CustomerWithMiscData();
        Customer.prototype.getNameLength = function() {
            return (this.getProperty("companyName") || "").length;
        };

        em.metadataStore.registerEntityTypeCtor("Customer", Customer);
        stop();
        em.fetchMetadata().then(function() {
            var custType = em.metadataStore.getEntityType("Customer");
            var cust1 = custType.createEntity();
            ok(cust1.entityType === custType, "entityType should be Customer");
            ok(cust1.entityAspect.entityState.isDetached(), "should be detached");
            em.attachEntity(cust1);
            ok(cust1.entityType === custType, "entityType should be Customer");
            ok(cust1.entityAspect.entityState.isUnchanged(), "should be unchanged");
            ok(cust1.getProperty("miscData") === "asdf");
            cust1.setProperty("companyName", "testxxx");
            ok(cust1.getNameLength() === 7, "getNameLength should be 7");
            start();
        }).fail(testFns.handleFail);
    });
    
    test("custom Customer type with new", function() {
        var em = newEm(newMs());

        var Customer = testFns.models.CustomerWithMiscData();
        Customer.prototype.getNameLength = function() {
            return (this.getProperty("companyName") || "").length;
        };

        em.metadataStore.registerEntityTypeCtor("Customer", Customer);
        stop();
        em.fetchMetadata().then(function() {
            var custType = em.metadataStore.getEntityType("Customer");
            var cust1 = new Customer();
             // this works because the fetchMetadataStore hooked up the entityType on the registered ctor.
            ok(cust1.entityType === custType, "entityType should be undefined");
            ok(cust1.entityAspect === undefined, "entityAspect should be undefined");
            em.attachEntity(cust1);
            ok(cust1.entityType === custType, "entityType should be Customer");
            ok(cust1.entityAspect.entityState.isUnchanged(), "should be unchanged");
            ok(cust1.getProperty("miscData") === "asdf");
            cust1.setProperty("companyName", "testxxx");
            ok(cust1.getNameLength() === 7, "getNameLength should be 7");
            start();
        }).fail(testFns.handleFail);
    });

    test("custom Customer type with new - v2", function() {
        var em = newEm(newMs());

        var Customer = testFns.models.CustomerWithMiscData();
        Customer.prototype.getNameLength = function() {
            return (this.getProperty("companyName") || "").length;
        };

        stop();
        em.fetchMetadata().then(function() {
            em.metadataStore.registerEntityTypeCtor("Customer", Customer);
            var custType = em.metadataStore.getEntityType("Customer");
            var cust1 = new Customer();
             // this works because the fetchMetadataStore hooked up the entityType on the registered ctor.
            ok(cust1.entityType === custType, "entityType should be undefined");
            ok(cust1.entityAspect === undefined, "entityAspect should be undefined");
            em.attachEntity(cust1);
            ok(cust1.entityType === custType, "entityType should be Customer");
            ok(cust1.entityAspect.entityState.isUnchanged(), "should be unchanged");
            ok(cust1.getProperty("miscData") === "asdf");
            cust1.setProperty("companyName", "testxxx");
            ok(cust1.getNameLength() === 7, "getNameLength should be 7");
            start();
        }).fail(testFns.handleFail);
    });
    
    test("entityState", function () {
        stop();
        runQuery(newEm(), function (customers) {
            var c = customers[0];
            testEntityState(c);
            start();
        });
    });

   
   


    test("entityType.getProperty nested", function() {
        
        var odType = testFns.metadataStore.getEntityType("OrderDetail");
        var orderType = testFns.metadataStore.getEntityType("Order");
        
        var customerProp = odType.getProperty("order.customer");
        var customerProp2 = orderType.getProperty("customer");
        ok(customerProp, "should not be null");
        ok(customerProp == customerProp2, "should be the same prop");
        var prop1 = odType.getProperty("order.customer.companyName");
        var prop2 = orderType.getProperty("customer.companyName");
        ok(prop1, "should not be null");
        ok(prop1 == prop2, "should be the same prop");
    });

    test("entityCtor materialization with js class", function () {
        // use a different metadata store for this em - so we don't polute other tests
        var em1 = newEm(newMs());
        var Customer = testFns.models.CustomerWithMiscData();

        em1.metadataStore.registerEntityTypeCtor("Customer", Customer);
        stop();
        runQuery(em1, function (customers) {
            var c = customers[0];
            ok(c.getProperty("miscData") === "asdf", "miscData property should contain 'asdf'");
            testEntityState(c);
            start();
        });
    });
    
    test("unmapped import export", function() {

        // use a different metadata store for this em - so we don't polute other tests
        var em1 = newEm(newMs());
        var Customer = testFns.models.CustomerWithMiscData();
        em1.metadataStore.registerEntityTypeCtor("Customer", Customer);
        stop();
        em1.fetchMetadata().then(function() {
            var custType = em1.metadataStore.getEntityType("Customer");
            var cust = custType.createEntity();
            em1.addEntity(cust);
            cust.setProperty("companyName", "foo2");
            cust.setProperty("miscData", "zzz");
            var bundle = em1.exportEntities();
            var em2 = new EntityManager({ serviceName: testFns.serviceName, metadataStore: em1.metadataStore });
            em2.importEntities(bundle);
            var entities = em2.getEntities();
            ok(entities.length === 1);
            var sameCust = entities[0];
            var cname = sameCust.getProperty("companyName");
            ok(cname === "foo2","companyName should === 'foo2'");
            var miscData = sameCust.getProperty("miscData");
            ok(miscData === "zzz","miscData should === 'zzz'");
            start();
        }).fail(testFns.handleFail);
    });

    test("generate ids", function () {
        var orderType = testFns.metadataStore.getEntityType("Order");
        var em = newEm();
        var count = 10;
        for (var i = 0; i < count; i++) {
            var ent = orderType.createEntity();
            em.addEntity(ent);
        }
        var tempKeys = em.keyGenerator.getTempKeys();
        ok(tempKeys.length == count);
        tempKeys.forEach(function (k) {
            ok(em.keyGenerator.isTempKey(k), "This should be a temp key: " + k.toString());
        });
    });

    test("createEntity and check default values", function () {
        var et = testFns.metadataStore.getEntityType("Customer");
        checkDefaultValues(et);
        var entityTypes = testFns.metadataStore.getEntityTypes();
        entityTypes.forEach(function (et) {
            checkDefaultValues(et);
        });
    });

    test("propertyChanged", function () {
        var em = newEm();
        var orderType = em.metadataStore.getEntityType("Order");
        ok(orderType);
        var orderDetailType = em.metadataStore.getEntityType("OrderDetail");
        ok(orderDetailType);
        var order = orderType.createEntity();
        var lastProperty, lastOldValue, lastNewValue;
        order.entityAspect.propertyChanged.subscribe(function (args) {
            ok(args.entity === order,"args.entity === order");
            lastProperty = args.propertyName;
            lastOldValue = args.oldValue;
            lastNewValue = args.newValue;
        });
        var order2 = orderType.createEntity();

        order.setProperty("employeeID", 1);
        order2.setProperty("employeeID", 999); // should not raise event
        ok(lastProperty === "employeeID");
        ok(lastNewValue === 1);
        order.setProperty("freight", 123.34);
        ok(lastProperty === "freight");
        ok(lastNewValue === 123.34);
        order.setProperty("shippedDate", new Date(2000, 1, 1));
        ok(lastProperty === "shippedDate");
        ok(lastNewValue.toDateString() == new Date(2000, 1, 1).toDateString());

        order.setProperty("employeeID", 2);
        ok(lastProperty === "employeeID");
        ok(lastNewValue === 2);
        ok(lastOldValue === 1);
    });

    test("propertyChanged unsubscribe", function () {
        var em = newEm();
        var orderType = em.metadataStore.getEntityType("Order");
        ok(orderType);
        var order = orderType.createEntity();
        var lastProperty, lastOldValue, lastNewValue;
        var key = order.entityAspect.propertyChanged.subscribe(function (args) {
            lastProperty = args.propertyName;
            lastOldValue = args.oldValue;
            lastNewValue = args.newValue;
        });
        order.setProperty("employeeID", 1);
        ok(lastProperty === "employeeID");
        ok(lastNewValue === 1);
        order.entityAspect.propertyChanged.unsubscribe(key);
        order.setProperty("employeeID", 999);
        ok(lastProperty === "employeeID");
        ok(lastNewValue === 1);
    });

    test("propertyChanged on query", function () {
        var em = newEm();
        var empType = em.metadataStore.getEntityType("Employee");
        ok(empType);
        var emp = empType.createEntity();
        emp.setProperty("employeeID", 1);
        var changes = [];
        emp.entityAspect.propertyChanged.subscribe(function (args) {
            changes.push(args);
        });
        em.attachEntity(emp);
        // now fetch
        var q = EntityQuery.fromEntities(emp);
        var uri = q._toUri(em.metadataStore);
        stop();
        em.executeQuery(q, function(data) {
            ok(changes.length === 1, "query merges should only fire a single property change");
            ok(changes[0].propertyName === null, "propertyName should be null on a query merge");
            start();
        }).fail(testFns.handleFail);
    });
    
    test("propertyChanged suppressed on query", function () {
        var em = newEm();
        var empType = em.metadataStore.getEntityType("Employee");
        ok(empType);
        var emp = empType.createEntity();
        emp.setProperty("employeeID", 1);
        var changes = [];
        emp.entityAspect.propertyChanged.subscribe(function (args) {
            changes.push(args);
        });
        Event.enable("propertyChanged", em, false);
        em.attachEntity(emp);
        // now fetch
        var q = EntityQuery.fromEntities(emp);
        stop();
        em.executeQuery(q, function (data) {
            ok(changes.length === 0, "query merges should not fire");
            start();
        }).fail(testFns.handleFail);
    });

    test("delete entity - check children", function () {
        var em = newEm();
        var order = createOrderAndDetails(em);
        var details = order.getProperty("orderDetails");
        var copyDetails = details.slice(0);
        ok(details.length > 0, "order should have details");
        order.entityAspect.setDeleted();
        ok(order.entityAspect.entityState.isDeleted(), "order should be deleted");

        ok(details.length === 0, "order should now have no details");

        copyDetails.forEach(function (od) {
            ok(od.getProperty("order") === null, "orderDetail.order should not be set");
            var defaultOrderId = od.entityType.getProperty("orderID").defaultValue;
            ok(od.getProperty("orderID") === defaultOrderId, "orderDetail.orderId should not be set");
            ok(od.entityAspect.entityState.isModified(), "orderDetail should be 'modified");
        });
    });

    test("delete entity - check parent", function () {
        var em = newEm();
        var order = createOrderAndDetails(em);
        var details = order.getProperty("orderDetails");
        var od = details[0];
        ok(details.indexOf(od) !== -1);
        var copyDetails = details.slice(0);
        ok(details.length > 0, "order should have details");
        od.entityAspect.setDeleted();
        ok(od.entityAspect.entityState.isDeleted(), "orderDetail should be deleted");

        ok(details.length === copyDetails.length - 1, "order should now have 1 less detail");
        ok(details.indexOf(od) === -1);

        ok(od.getProperty("order") === null, "orderDetail.order should not be set");
        var defaultOrderId = od.entityType.getProperty("orderID").defaultValue;
        // we deliberately leave the orderID alone after a delete - we are deleting the entity and do not want a 'mod' to cloud the issue
        // ( but we do 'detach' the Order itself.)
        ok(od.getProperty("orderID") === order.getProperty("orderID"), "orderDetail.orderId should not change as a result of being deleted");
    });

    test("detach entity - check children", function () {
        var em = newEm();
        var order = createOrderAndDetails(em);
        var details = order.getProperty("orderDetails");
        var copyDetails = details.slice(0);
        ok(details.length > 0, "order should have details");
        em.detachEntity(order);
        ok(order.entityAspect.entityState.isDetached(), "order should be detached");

        ok(details.length === 0, "order should now have no details");

        copyDetails.forEach(function (od) {
            ok(od.getProperty("order") === null, "orderDetail.order should not be set");
            var defaultOrderId = od.entityType.getProperty("orderID").defaultValue;
            ok(od.getProperty("orderID") === defaultOrderId, "orderDetail.orderId should not be set");
            ok(od.entityAspect.entityState.isModified(), "orderDetail should be 'modified");
        });
    });

   test("hasChanges", function() {
        var em = newEm();
        
        var orderType = em.metadataStore.getEntityType("Order");
        var orderDetailType = em.metadataStore.getEntityType("OrderDetail");
        var order1 = createOrderAndDetails(em, false);
        var order2 = createOrderAndDetails(em, false);
        
        var valid = em.hasChanges();
        ok(valid, "should have some changes");
        try {
            var x = em.hasChanges("order");
            ok(false, "should have failed");
        } catch(e) {
            ok(e.message.indexOf("order") != -1, " should have an error message about 'order'");
        }
        valid = em.hasChanges("Order");
        ok(valid, "should have changes for Orders");
        try {
            var y = em.hasChanges(["Order", "OrderDetXXX"]);
            ok(false, "should have failed");
        } catch (e) {
            ok(e.message.indexOf("OrderDetXXX") != -1, " should have an error message about 'order'");
        }
        valid = em.hasChanges([orderType, orderDetailType]);
        ok(valid, "should have changes for Orders or OrderDetails");
        em.getChanges(orderType).forEach(function(e) {
            e.entityAspect.acceptChanges();
        });
        valid = !em.hasChanges(orderType);
        ok(valid, "should not have changes for Orders");
        valid = em.hasChanges("OrderDetail");
        ok(valid, "should still have changes for OrderDetails");
        em.getChanges(orderDetailType).forEach(function(e) {
            e.entityAspect.acceptChanges();
        });
        
        valid = !em.hasChanges(["Order", "OrderDetail"]);
        ok(valid, "should no longer have changes for Orders or OrderDetails");
        valid = !em.hasChanges();
        ok(valid, "should no longer have any changes");
    });
    
    test("rejectChanges", function() {
        var em = newEm();
        var orderType = em.metadataStore.getEntityType("Order");
        var orderDetailType = em.metadataStore.getEntityType("OrderDetail");
        var order1 = createOrderAndDetails(em, false);
        var order2 = createOrderAndDetails(em, false);
        
        var valid = em.hasChanges();
        ok(valid, "should have some changes");
        valid = em.hasChanges(orderType);
        ok(valid, "should have changes for Orders");
        valid = em.hasChanges([orderType, orderDetailType]);
        ok(valid, "should have changes for Orders or OrderDetails");
        em.getChanges(orderType).forEach(function(e) {
            e.entityAspect.acceptChanges();
            e.setProperty("freight", 100);
            ok(e.entityAspect.entityState.isModified(), "should be modified");
        });
        var rejects = em.rejectChanges();
        ok(rejects.length > 0, "should have rejected some");
        var hasChanges = em.hasChanges(orderType);
        ok(!hasChanges, "should not have changes for Orders");
        hasChanges = em.hasChanges(orderDetailType);
        ok(!hasChanges, "should not have changes for OrderDetails");

        valid = !em.hasChanges();
        ok(valid, "should no longer have any changes");
    });
   

    function createOrderAndDetails(em, shouldAttachUnchanged) {
        if (shouldAttachUnchanged === undefined) shouldAttachUnchanged = true;
        var metadataStore = em.metadataStore;
        var orderType = em.metadataStore.getEntityType("Order");
        var orderDetailType = em.metadataStore.getEntityType("OrderDetail");
        var order = orderType.createEntity();
        ok(order.entityAspect.entityState.isDetached(), "order should be 'detached");
        for (var i = 0; i < 3; i++) {
            var od = orderDetailType.createEntity();
            od.setProperty("productID", i + 1); // part of pk
            order.getProperty("orderDetails").push(od);
            ok(od.entityAspect.entityState.isDetached(), "orderDetail should be 'detached");
        }
        var orderId;
        if (shouldAttachUnchanged) {
            em.attachEntity(order);
            orderId = order.getProperty("orderID");
            order.getProperty("orderDetails").forEach(function (od) {
                ok(od.getProperty("order") === order, "orderDetail.order not set");
                ok(od.getProperty("orderID") === orderId, "orderDetail.orderId not set");
                ok(od.entityAspect.entityState.isUnchanged(), "orderDetail should be 'unchanged");
            });
        } else {
            em.addEntity(order);
            orderId = order.getProperty("orderID");
            order.getProperty("orderDetails").forEach(function (od) {
                ok(od.getProperty("order") === order, "orderDetail.order not set");
                ok(od.getProperty("orderID") === orderId, "orderDetail.orderId not set");
                ok(od.entityAspect.entityState.isAdded(), "orderDetail should be 'added");
            });
        }
        return order;
    }


    function runQuery(em, callback) {

        var query = new EntityQuery()
            .from("Customers")
            .where("companyName", "startsWith", "C")
            .orderBy("companyName");

        em.executeQuery(query, function (data) {
            callback(data.results);
        }).fail(testFns.handleFail);
    }

    function testEntityState(c) {
        ok(c.getProperty("companyName"), 'should have a companyName property');
        ok(c.entityAspect.entityState.isUnchanged(), "should be unchanged");
        c.setProperty("companyName", "Test");
        ok(c.getProperty("companyName") === "Test", "companyName should be 'Test'");
        ok(c.entityAspect.entityState.isModified(), "should be modified after change");
        c.entityAspect.acceptChanges();
        ok(c.entityAspect.entityState.isUnchanged(), "should be unchanged after acceptChanges");

        c.setProperty("companyName", "Test2");
        ok(c.getProperty("companyName") === "Test2", "companyName should be 'Test2'");
        ok(c.entityAspect.entityState.isModified(), "should be modified after change");
        c.entityAspect.rejectChanges();
        ok(c.getProperty("companyName") === "Test", "companyName should be 'Test' after rejectChanges");
        ok(c.entityAspect.entityState.isUnchanged(), "should be unchanged after reject changes");
    }

    function checkDefaultValues(structType) {
        var props = structType.getProperties();
        ok(props.length, "No data properties for structType: " + structType.name);
        var fn = structType.createEntity || structType.createInstance;
        var entity = fn.apply(structType);
        props.forEach(function (p) {
            var v = entity.getProperty(p.name);
            if (p.isUnmapped) {
                // do nothing
            } else if (p.isDataProperty) {
                if (p.isComplexProperty) {
                    ok(v !== null, core.formatString("'%1': prop: '%2' - was null",
                        structType.name, p.name ));
                } else if (p.isNullable) {
                    ok(v === null, core.formatString("'%1': prop: '%2' - was: '%3' - should be null",
                        structType.name, p.name, v));
                } else {
                    ok(v === p.defaultValue, core.formatString("'%1': prop: '%2' - was: '%3' - should be defaultValue: '%4'",
                        structType.name, p.name, v, p.defaultValue));
                }
            } else {
                if (p.isScalar) {
                    ok(v === null, core.formatString("'%1': prop: '%2' - was: '%3' - should be null",
                        structType.name, p.name, v));
                } else {
                    ok(v.arrayChanged, "value should be a relation array");
                }
            }
        });
    }


    return testFns;
});