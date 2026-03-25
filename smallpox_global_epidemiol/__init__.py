"""Evolution of Smallpox Cases by Country: Global Epidemiological Database 1994-202
DOI:https://github.com/juanmoisesd/smallpox-global-epidemiological-database-1994-2024"""
__version__="1.0.0"
import pandas as pd,io,requests
def load_data(f=None):
  rid="https://github.com/juanmoisesd/smallpox-global-epidemiological-database-1994-2024".split(".")[-1];m=requests.get("https://zenodo.org/api/records/"+rid,timeout=30).json();csvs=[x for x in m.get("files",[]) if x["key"].endswith(".csv")]
  if not csvs:raise ValueError("No CSV")
  tgt=next((x for x in csvs if f and x["key"]==f),csvs[0]);return pd.read_csv(io.StringIO(requests.get(tgt["links"]["self"],timeout=60).text))
def cite():return "de la Serna, Juan Moisés (2025). Evolution of Smallpox Cases by Country: Global Epidemiologic"
def info():print("DOI: https://github.com/juanmoisesd/smallpox-global-epidemiological-database-1994-2024\nGitHub: https://github.com/juanmoisesd/smallpox-global-epidemiological-database-1994-2024")
