import json
import boto3

def regist(table, event):
    response = table.scan(
    Select='ALL_ATTRIBUTES'
    )
    max_primary_key_value = 0
    if len(response["Items"]) != 0:
        for record in response["Items"]:
            max_primary_key_value = max(max_primary_key_value, int(record["UserId"]))
    
    max_primary_key_value += 1
    item = {
        "UserId":str(max_primary_key_value),
        "email":event["email"],
        "balance":0,
        "points":0,
        "FirstName":event["FirstName"],
        "LastName":event["LastName"],
        "Password":event["Password"],
        "activeFlag":1
    }
    return item
    
def login(table, event):
    response = table.scan(
    Select='ALL_ATTRIBUTES',
    )
    for record in response["Items"]:
        if event["Password"] == record["Password"] and \
            event["FirstName"] == record["FirstName"] and record["activeFlag"] != 0:
                return record
    return {'status': 101, 'body': json.dumps('Wrong Password or Name.')}
            
def delete(item, event):
    if item["activeFlag"] == 1:
        item["activeFlag"] = 0
        return item
    else:
        return -1
    
def add_point(item, event):
    item["points"] = item["points"] + json.loads(event["val"])
    return item

def sub_point(item, event):
    if item["points"] >= json.loads(event["val"]):
        item["points"] = item["points"] - json.loads(event["val"])
        return item
    else:
        return -1

def add_balance(item, event):
    item["balance"] = item["balance"] + json.loads(event["val"])
    return item
    
def sub_balance(item, event):
    if item["balance"] >= json.loads(event["val"]):
        item["balance"] = item["balance"] - json.loads(event["val"])
        return item
    else:
        return -1

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('bakery') 
    
    status = event["status"]
    if status == "regist":
        item = regist(table, event)
    elif status == "login":
        item = login(table, event)
    else:
        try:
            response = table.get_item(Key={'UserId': event["UserId"]})
            item = response.get('Item')
        except Exception as e:
            return {'status': 500, 'body': json.dumps('Exception occurred.')}
    
        item = login(item, event)
    if status == "delete":
        item = delete(item, event)
    elif status == "add_point":
        item = add_point(item, event)
    elif status == "sub_point":
        item = sub_point(item, event)
    elif status == "add_balance":
        item = add_balance(item, event)
    elif status == "sub_balance":
        item = sub_balance(item, event)
    
    if item == -1:
        return {'status': 500, 'body': json.dumps('Exception occurred.')}
    else:
        table.put_item(
            Item = item
        )
        return item

