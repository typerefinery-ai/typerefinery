from sqlmodel import Field, Session, SQLModel, create_engine, select
import strawberry
from strawberry.asgi import GraphQL
from typing import Optional

@strawberry.type
class Theme(SQLModel, table=True):
    themeid: str = Field(default=None, primary_key=True)
    projectid: Optional[str] = Field(default=None, index=True)
    scope: str = Field(index=True)
    icon: Optional[str] = Field(default=None, index=True)
    label: str = Field(index=True)
    description: str
    type: str
    theme: str
    data: str


class ThemeUtils():

  def read_theme(self, themeid: str, engine: any):
    with Session(engine) as session:
      statement = select(Theme).where(Theme.themeid == themeid)
      results = session.exec(statement)
      return results.first()

  def read_themes(self, engine: any):
    with Session(engine) as session:
      return session.exec(select(Theme)).all()

  def update_theme(self, themeid: str, theme: Theme, engine: any):
    with Session(engine) as session:
      atheme = self.read_theme(themeid=themeid, engine=engine)
      if atheme:
        atheme.projectid = theme.projectid
        atheme.scope = theme.scope
        atheme.icon = theme.icon
        atheme.label = theme.label
        atheme.description = theme.description
        atheme.type = theme.type
        atheme.theme = theme.theme
        atheme.data = theme.data
        session.add(atheme)
        session.commit()
        session.refresh(atheme)

        return atheme

      return atheme

  def delete_theme(self, themeid: str,engine: any):
    with Session(engine) as session:
      atheme = self.read_theme(themeid=themeid, engine=engine)
      if atheme:
        session.delete(atheme)
        session.commit()
        return atheme

      return atheme

  def create_theme(self, theme: Theme, engine: any):
    with Session(engine) as session:
      atheme = self.read_theme(themeid=theme.themeid, engine=engine)
      if atheme:
        return atheme

      session.add(theme)
      session.commit()
      session.refresh(theme)

      return theme
