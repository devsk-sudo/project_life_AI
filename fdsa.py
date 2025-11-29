import google.generativeai as genai
genai.configure(api_key="AIzaSyD_El1U098OO6jHcQu-OA2CRanmNxIS52k")
print([m.name for m in genai.list_models()])
