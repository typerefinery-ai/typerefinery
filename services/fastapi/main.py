
# allow importing og service local packages
import os
import sys
where_am_i = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, where_am_i+"/__packages__")
sys.path.append(where_am_i)
# end of local package imports

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
