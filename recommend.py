from numpy.core.numeric import NaN
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from ast import literal_eval
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.metrics.pairwise import linear_kernel, cosine_similarity
from nltk.stem.snowball import SnowballStemmer
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.corpus import wordnet
# from surprise import Reader, Dataset, SVD
import sys
import os
import warnings; warnings.simplefilter('ignore')
from io import BytesIO
from io import StringIO
import numbers
import math
def isnan(value):
    try:
      import math
      return math.isnan(float(value))
    except:
      return False
perfect_dict = []
def printData(data):
    pd.options.display.max_columns = 10    
    restaurantname=list(data['restaurantname']);
    email=list(data['email']);
    address=list(data['address']);
    description=list(data['description']);
    location=list(data['location']);
    wr=list(data['wr']);
    rating=list(data['rating']);
    _id=list(data['_id']);
    take_length = min(len(restaurantname),len(wr))
    for i in range(take_length):
        temp_dict={}
        temp_dict["restaurantname"]=restaurantname[i]
        if isnan(wr[i]) ==False:
            temp_dict["wr"] = wr[i]
        else: 
            temp_dict["wr"] = 0
        temp_dict["email"]=email[i]
        temp_dict["address"] = address[i]
        temp_dict["description"]=description[i]
        temp_dict["_id"] = _id[i]
        temp_dict["rating"] = rating[i]
        perfect_dict.append(temp_dict)
def main():
    csv = sys.argv[1]
    data = StringIO(csv) 
    md=pd.read_csv(data)
    md['genres'] = md['genres'].fillna('[]').apply(literal_eval).apply(lambda x: [i['_id'] for i in x] if isinstance(x, list) else [])
    vote_counts = md[md['numberOfReview'].notnull()]['numberOfReview'].astype('int')
    vote_averages = md[md['rating'].notnull()]['rating'].astype('int')
    C = vote_averages.mean()
    m = vote_counts.quantile(0.55)
    qualified = md[(md['numberOfReview'] >= m) & (md['numberOfReview'].notnull()) & (md['rating'].notnull())][["restaurantname",'numberOfReview', 'rating', 'genres',"email","address","location",'description',"_id"]]
    qualified['numberOfReview'] = qualified['numberOfReview'].astype('int')
    qualified['rating'] = qualified['rating'].astype('int')
    qualified.shape
    def weighted_rating(x):
        v = x['numberOfReview']
        R = x['rating']
        return (v/(v+m) * R) + (m/(m+v) * C)
    def build_chart(genre, percentile=0.5):
        df = gen_md[gen_md['genres'] == genre]
        if not len(df):
            return []
        vote_counts = df[df['numberOfReview'].notnull()]['numberOfReview'].astype('int')
        vote_averages = df[df['rating'].notnull()]['rating'].astype('int')
        C = vote_averages.mean()
        m = vote_counts.quantile(percentile)
        qualified = df[(df['numberOfReview'] >= m) & (df['numberOfReview'].notnull()) & (df['rating'].notnull())][["restaurantname",'numberOfReview', 'rating',"email","address","location",'description',"_id"]]
        qualified['numberOfReview'] = qualified['numberOfReview'].astype('int')
        qualified['rating'] = qualified['rating'].astype('int')
        
        qualified['wr'] = qualified.apply(lambda x: (x['numberOfReview']/(x['numberOfReview']+m) * x['rating']) + (m/(m+x['numberOfReview']) * C), axis=1)
        qualified = qualified.sort_values('wr', ascending=False).head(250).drop_duplicates()
        
        return qualified
    qualified['wr'] = qualified.apply(weighted_rating, axis=1)
    qualified = qualified.sort_values('wr', ascending=False).head(250)
    s = md.apply(lambda x: pd.Series(x['genres']),axis=1).stack().reset_index(level=1, drop=True)
    s.name = 'genres'
    gen_md = md.drop('genres', axis=1).join(s)

    args=sys.argv[2:]
    if len(args)!=0:
        args=sys.argv[2].split(',')
        for x in args:
            data=build_chart(x)
            if  len(data)!=0: 
                data=data.head(5)
                printData(data)
    else:
        data=qualified.head(15)
        printData(data)
    sys.stdout.reconfigure(encoding='utf-8')
    print(perfect_dict) 
if __name__ == "__main__":
   main()