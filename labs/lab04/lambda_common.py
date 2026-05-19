"""Shared helpers for Lab 04 Lambda handlers."""
import json


def apigw_json(status_code: int, body: dict) -> dict:
    """API Gateway proxy integration response envelope."""
    return {"statusCode": status_code, "body": json.dumps(body)}
