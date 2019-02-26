use sample_domain-testing

db.getCollection("ModelBs").drop();
const ModelBs = db.getCollection("ModelBs");
db.ModelBs.insert([
{
    "_id": "0000-0000-00000-000003",
    "firstName": "Jakub",
    "lastName": "Mifek",
    "metadata": {
        "type": "ModelA",
        "created": "2019-02-26T12:14:04.697807",
        "modified": "2019-02-26T12:14:04.697820"
    },
    "associations": []
}, {
    "_id": "0000-0000-00000-000004",
    "firstName": "Michal",
    "lastName": "Mozik",
    "metadata": {
        "type": "ModelA",
        "created": "2019-02-26T12:14:04.697902",
        "modified": "2019-02-26T12:14:04.697912"
    },
    "associations": [
        {
            "_id": "0000-0000-00000-000001",
            "modelBId": "0000-0000-00000-000004",
            "modelBInvolvedId": "0000-0000-00000-000003",
            "metadata": {
                "type": "HeadPositionAssociation",
                "created": "2019-02-26T12:14:04.697152",
                "modified": "2019-02-26T12:14:04.697172"
            }
        }
    ]
}]);

db.getCollection("ModelCs").drop();
const ModelCs = db.getCollection("ModelCs");
db.ModelCs.insert([
{
    "_id": "0000-0000-00000-000002",
    "modelBIds": [
        "0000-0000-00000-000003",
        "0000-0000-00000-000004"
    ],
    "metadata": {
        "type": "ModelC",
        "created": "2019-02-26T12:14:04.697352",
        "modified": "2019-02-26T12:14:04.697364"
    }
}]);

