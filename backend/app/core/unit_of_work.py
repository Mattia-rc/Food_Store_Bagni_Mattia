from sqlalchemy import text

from app.core.database import is_sqlite, session_factory


class UnitOfWork:
    def __init__(self, *, write: bool = False):
        self.write = write

    def __enter__(self):
        self.session = session_factory()
        try:
            if self.write and is_sqlite:
                self.session.execute(text("BEGIN IMMEDIATE"))
            self.setup_repositories()
        except BaseException:
            self.session.close()
            raise
        return self

    def setup_repositories(self) -> None:
        pass

    def flush(self) -> None:
        self.session.flush()

    def __exit__(self, exc_type, exc, traceback):
        try:
            if exc_type is not None:
                self.session.rollback()
            else:
                try:
                    self.session.commit()
                except BaseException:
                    self.session.rollback()
                    raise
        finally:
            self.session.close()
