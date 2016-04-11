# -*- coding: utf-8 -*-
import logging
import sys
import os
import thread
import time
import random
from socketIO_client import SocketIO, LoggingNamespace

class Client(object):
  def __init__(self, client_factory):
    self.logger = logging.getLogger('Graduation')
    self.socket = None
    self.client_factory = client_factory
    self.host = client_factory.host
    self.port = client_factory.port

  def connect(self):
    self.socket = SocketIO(self.host, self.port, LoggingNamespace);
    self.socket.on('device_data_response', self.on_response);
    self.sendMessage(0)
    self.socket.wait()

  def on_response(self):
    time.sleep(2);
    tem = random.randint(0, 40);
    self.sendMessage(tem)

  def sendMessage(self, tem):
    data = dict();
    data["id"] = 1
    data["name"] = "name"
    params = dict();
    params["temperature"] = tem
    data["params"] = params
    self.socket.emit('device_data', data)

class ClientFactory(object):
  def __init__(self, connection_plan):
    self.logger = logging.getLogger('Graduation')
    self.host = "192.168.23.6"
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

