############################################################## 
# Helper class to help porting code using JS object notation:
#
#   JS: var obj = {type: "unknown"}
#   JS: obj.type = "analog"
#
#   PY: obj = JsObject({"type" : "unknown"})
#   PY: obj.type = "analog"
#
class JsObject(dict):
    def __init__(self, d):
        for k in d.keys():
            setattr(self, k, d[k])
  


############################################################## 
# Map value from one range to another
#
def js_map(x, inMin, inMax, outMin, outMax):
    return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin


