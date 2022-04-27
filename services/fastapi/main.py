from typing import Optional

from fastapi import FastAPI, Form
import json
from scripts.G_to_WebCola import get_data as gquery


app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Optional[str] = None):
    return {"item_id": item_id, "q": q}

@app.post("/query")
async def read_query(url: str = Form(...), port: str = Form(...), database: str = Form(...), gQuery: str = Form(...)):
    gConnect = {}
    gConnect['url'] = url
    gConnect['port'] = port
    gConnect['database'] = database
    gConnect['gQuery'] = gQuery
    # query grakn
    colaGraph = gquery(gConnect=gConnect)
    return json.dumps(colaGraph)
