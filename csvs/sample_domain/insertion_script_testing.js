use sample_domain-testing

db.getCollection("ModelBs").drop();
const ModelBs = db.getCollection("ModelBs");
db.ModelBs.insert([
{
    "_id": "a47d176a-93f0-4d02-879f-bbc8d7537cc0",
    "firstName": "Jakub",
    "lastName": "Mifek",
    "metadata": {
        "type": "ModelA",
        "created": "2019-02-26T12:22:05.680271",
        "modified": "2019-02-26T12:22:05.680432"
    },
    "associations": []
}, {
    "_id": "e227ed1d-ed11-4e6a-b6cc-6900e4d8c98d",
    "firstName": "Michal",
    "lastName": "Mozik",
    "metadata": {
        "type": "ModelA",
        "created": "2019-02-26T12:22:05.680523",
        "modified": "2019-02-26T12:22:05.680533"
    },
    "associations": [
        {
            "_id": "9b772714-aeb7-4a87-87a9-81d2900b1012",
            "modelBId": "e227ed1d-ed11-4e6a-b6cc-6900e4d8c98d",
            "modelBInvolvedId": "a47d176a-93f0-4d02-879f-bbc8d7537cc0",
            "metadata": {
                "type": "HeadPositionAssociation",
                "created": "2019-02-26T12:22:05.679985",
                "modified": "2019-02-26T12:22:05.680004"
            }
        }
    ]
}]);

db.getCollection("ModelCs").drop();
const ModelCs = db.getCollection("ModelCs");
db.ModelCs.insert([
{
    "_id": "73b9faeb-84a8-4673-98a1-494821f119a9",
    "modelBIds": [
        "a47d176a-93f0-4d02-879f-bbc8d7537cc0",
        "e227ed1d-ed11-4e6a-b6cc-6900e4d8c98d"
    ],
    "metadata": {
        "type": "ModelC",
        "created": "2019-02-26T12:22:05.680160",
        "modified": "2019-02-26T12:22:05.680170"
    }
}]);

