#coding=utf-8
#!/usr/bin/env python
#
# Copyright 2009 Facebook
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.

import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
import tornado.escape
import os.path
import logging
import json
import sys

##引入工具包
from tools import In2CSV


from tornado.options import define, options

define("port", default=8888, help="run on the given port", type=int)

# 获取JSON字符串
def get_json_message(info):
    jsonData = json.dumps(info, separators=(',', ':'))
    return jsonData


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello, world")


class ChatSocketHandler(tornado.websocket.WebSocketHandler):
    waiters = set()
    waitersMap = dict()
    cache = []
    cache_size = 200

    def allow_draft76(self):
        # for ios 5.0 safari
        return True

    def check_origin(self, origin):
        return True

    def open(self):
        print ("new client opened, client count = ", len(ChatSocketHandler.waiters))
        ChatSocketHandler.waiters.add(self)

    def on_close(self):
        print ("one client leave, client count = ", len(ChatSocketHandler.waiters))
        ChatSocketHandler.waiters.remove(self)
        ChatSocketHandler.waitersMap.pop(self)


    @classmethod
    def update_cache(cls, chat):
        cls.cache.append(chat)
        if len(cls.cache) > cls.cache_size:
            cls.cache = cls.cache[-cls.cache_size:]


    @classmethod
    def send_update(cls, chat):
        logging.info("sending message to %d waiters", len(cls.waiters))
        for waiter in cls.waiters:
            try:
                waiter.write_message(chat)
            except:
                logging.error("Error sending message", exec_info=True)



    @classmethod
    def send_updateWithId(cls, id, message):
        logging.info("sending message to id=%r waiter message=%r", id, message)
        for key, value in cls.waitersMap.items():
            if value == id:
                waiter = key
                waiter.write_message(message)


    def on_message(self, message):
        logging.info("got message %r", message)
        dictInfo = eval(message)

        # 检查是否符合要求
        if not isinstance(dictInfo, dict):
            return

        # 信息处理{服务器使用s_作为前缀，客户端使用c_作为前缀}
        msg_type = dictInfo['msg_type']
        user_id = dictInfo['user_id']

        if  msg_type == 'c_notice_id_Info':
            ChatSocketHandler.waitersMap[self] = user_id

            info = {'msg_type':'s_get_id_Info'}
            jsonStr = get_json_message(info)

            ChatSocketHandler.send_updateWithId(user_id, jsonStr)

        elif msg_type == 'c_task_exec':
            taskInfo = dictInfo['taskInfo']
            if taskInfo['cli'] == 'In2CSV':
                try:
                    f_out = open(taskInfo['output_path'], 'wt')
                except Exception as e:
                    info = {'msg_type':'s_err_progress','content':e.__str__()}
                    jsonStr = get_json_message(info)
                    ChatSocketHandler.send_updateWithId(user_id, jsonStr)
                    pass
                else:
                    info = {
                        'task_id': taskInfo['task_id'],
                        'msg_type': 's_task_exec_running'
                    }
                    ChatSocketHandler.send_updateWithId(user_id, get_json_message(info))

                    utility = In2CSV.In2CSV(output_file=f_out)
                    utility.args.input_path = taskInfo['input_path']

                    #1.解析其他变量参数(1)可选参数
                    if taskInfo.has_key('format'):
                        utility.args.filetype = taskInfo['format']

                    if taskInfo.has_key('schema'):
                        utility.args.schema = taskInfo['schema']

                    if taskInfo.has_key('key'):
                        utility.args.key = taskInfo['key']

                    if taskInfo.has_key('snifflimit'):
                        utility.args.snifflimit = taskInfo['snifflimit']

                    if taskInfo.has_key('sheet'):
                        utility.args.sheet = taskInfo['sheet']

                    if taskInfo.has_key('no_inference'):
                        utility.args.no_inference = taskInfo['no_inference']

                    #2.解析其他变量参数(2)内置参数(通用参数)
                    if taskInfo.has_key('delimiter'):
                        utility.args.delimiter = taskInfo['delimiter']

                    if taskInfo.has_key('tabs'):
                        utility.args.tabs = taskInfo['tabs']

                    if taskInfo.has_key('quotechar'):
                        utility.args.quotechar = taskInfo['quotechar']

                    if taskInfo.has_key('quoting'):
                        utility.args.quoting = taskInfo['quoting']

                    if taskInfo.has_key('doublequote'):
                        utility.args.doublequote = taskInfo['doublequote']

                    if taskInfo.has_key('escapechar'):
                        utility.args.escapechar = taskInfo['escapechar']

                    if taskInfo.has_key('maxfieldsize'):
                        utility.args.maxfieldsize = taskInfo['maxfieldsize']

                    if taskInfo.has_key('encoding'):
                        utility.args.encoding = taskInfo['encoding']

                    if taskInfo.has_key('skipinitialspace'):
                        utility.args.skipinitialspace = taskInfo['skipinitialspace']

                    if taskInfo.has_key('no_header_row'):
                        utility.args.no_header_row = taskInfo['no_header_row']

                    if taskInfo.has_key('verbose'):
                        utility.args.verbose = taskInfo['verbose']

                    if taskInfo.has_key('linenumbers'):
                        utility.args.linenumbers = taskInfo['linenumbers']

                    if taskInfo.has_key('zero_based'):
                        utility.args.zero_based = taskInfo['zero_based']


                    #检查文件格式是否支持
                    if not utility.guess_fileType_supported(utility.args.input_path):
                        info = {
                            'task_id': taskInfo['task_id'],
                            'msg_type': 's_err_fileType_not_supported'
                        }
                        ChatSocketHandler.send_updateWithId(user_id, get_json_message(info))
                    else:
                        try:
                            utility.main()
                        except Exception as e:
                            info = {'msg_type':'s_err_progress','content':e.__str__()}
                            jsonStr = get_json_message(info)
                            ChatSocketHandler.send_updateWithId(user_id, jsonStr)
                        else:
                            #发送处理完毕的消息
                            info = {
                                'task_id': taskInfo['task_id'],
                                'msg_type': 's_task_exec_result',
                                'result': True
                            }
                            ChatSocketHandler.send_updateWithId(user_id, get_json_message(info))

                    #关闭文件句柄
                    f_out.close()

            pass

        #ChatSocketHandler.send_update(message)

class EchoWebSocket(tornado.websocket.WebSocketHandler):
    def open(self):
        print "WebSocket opened"

    def on_message(self, message):
        self.write_message(u"You said: " + message)

    def on_close(self):
        print "WebSocket closed"

    def check_origin(self, origin):
        return True


def main():
    tornado.options.parse_command_line()

    # remove params --port=?
    param_port = '--port=' + str(options.port)
    if param_port in sys.argv:
        sys.argv.remove(param_port)

    # create application
    application = tornado.web.Application([
        (r"/", MainHandler),
        (r"/websocket", ChatSocketHandler)
    ])
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()