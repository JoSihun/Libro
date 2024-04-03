from sqlalchemy import Engine, text
from typing import List,Dict,Tuple
from datetime import datetime
import pandas as pd




def get_total_book_count(engine : Engine) -> int :
    with engine.connect() as con : 
        statement = text(
                """
                SELECT id 
                FROM book
                ORDER BY id DESC
                LIMIT 1
                """
                )

        result = con.execute(statement)
        size = result.fetchone()[0]
    
    return size



def get_book_list(engine : Engine, recommended : tuple) -> List[dict] :
    
    with engine.connect() as con :
        statement = text(
            '''
            SELECT *
            FROM book
            WHERE id in {} and shorts_url is not null
            '''.format(recommended)
        )

        result = con.execute(statement)
        response = []
        keys = result.keys()
        for r in result :   
            response_data = dict() 
            for key in keys:
                response_data[key] = r._get_by_key_impl_mapping(key)
                if isinstance(response_data[key], datetime):
                    response_data[key] = response_data[key].strftime("%Y-%m-%d %H:%M:%S")
                    
            response.append(response_data)
        return response

def get_user_book_matrix(engine : Engine) -> pd.DataFrame:
    with engine.connect() as con :
        statement = text(
            '''
            SELECT user_id, book_id, rating
            FROM user_book
            WHERE is_deleted = false or is_deleted is NULL
            '''
        )
        result = con.execute(statement)
        data = result.fetchall()
        
        df = pd.DataFrame(data, columns=result.keys())

        return df.fillna(0)

def get_book_matrix(engine : Engine) -> pd.DataFrame: 
    with engine.connect() as con : 
        statement = text(
            '''
            SELECT id as book_id, author, title, rating
            FROM book
            WHERE id in (
                SELECT distinct(book_id)
                FROM user_book
                WHERE is_deleted = false or is_deleted is NULL
            )
            '''
        )
        result = con.execute(statement)
        data = result.fetchall()

        
        df = pd.DataFrame(data, columns = ['book_id','author', 'title', 'rating'])
        
        return df.fillna(0)

def get_user_book_count_distinct(engine : Engine) -> int :
    with engine.connect() as con :
        statement = text(
            '''
            SELECT count(distinct book_id)
            FROM user_book
            WHERE is_deleted = false or is_deleted is NULL
            '''
        )
        result = con.execute(statement)
        data = result.fetchone()[0]
        return data
    
def get_exist_shorts_book_id_list(engine : Engine) -> list :
    with engine.connect() as con : 
        statement = text(
            '''
            SELECT id
            FROM book
            WHERE shorts_url is not null
            '''
        )
        result = con.execute(statement)
        data = result.fetchall()
        numbers_list = [number[0] for number in data]
        return numbers_list
            
def get_user_matrix(engine : Engine) -> pd.DataFrame :
    with engine.connect() as con : 
        statement = text(
            '''
            SELECT id, age, gender, interest
            FROM user
            WHERE (is_deleted = false or is_deleted is NULL)
            AND id in (
                SELECT distinct(user_id)
                FROM user_book
                WHERE is_deleted = false or is_deleted is NULL
            )
            '''
        )
        result = con.execute(statement)
        data = result.fetchall()
        df = pd.DataFrame(data, columns = ['user_id','age', 'gender', 'interest'])
        return df.fillna(0)
