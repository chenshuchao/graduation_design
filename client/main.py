# -*- coding: utf-8 -*-
import logging
import sys
import os
import thread
import time
from socketIO_client import SocketIO, LoggingNamespace

class Client(object):
  def __init__(self, client_factory):
    self.logger = logging.getLogger('bench_mark')
    self.socket = None
    self.client_factory = client_factory
    self.host = client_factory.host
    self.port = client_factory.port

  def connect(self):
    self.socket = SocketIO(self.host, self.port, LoggingNamespace);
    data = dict();
    data["id"] = 1;
    data["password"] = 123456;
    data["temperature"] = 28;
    self.socket.emit('device_data', data)
    self.socket.wait()

  def on_chat_message(self, *args):
    self.logger.info("chat message: ", args)
    print("chat message: ", args)
    thread.start_new_thread(self.client_factory.new_client, ())

class ClientFactory(object):
  def __init__(self, connection_plan):
    self.logger = logging.getLogger('bench_mark')
    self.host = "localhost"
    self.port = 8070
    self.connection_plan = connection_plan
    self.connected = 0

  def new_client(self):
    self.logger.info("I am running.")
    if self.connected < self.connection_plan:
      self.connected = self.connected + 1
      print("Client-"+str(self.connected))
      client = Client(self)
      client.connect()
    else:
      print("All clients have connected.")

  def start(self):
    try:
      thread.start_new_thread(self.new_client, ())
    except Exception, e:
      print("Error: %s", str(e))
    while 1:
      pass

if __name__ == '__main__':
  factory = ClientFactory(1)
  factory.start()

