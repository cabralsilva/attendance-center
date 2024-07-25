import { ArrowDownOutlined, CheckCircleOutlined, CheckOutlined, ClockCircleOutlined, LoadingOutlined, LogoutOutlined, SendOutlined, UserOutlined } from "@ant-design/icons";
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Badge, Button, Col, Divider, Form, Layout, Menu, Row, Tag, Tooltip, notification } from "antd";
import TextArea from "antd/es/input/TextArea";
import Sider from "antd/es/layout/Sider";
import { Content, Footer, Header } from "antd/es/layout/layout";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LS_CHAT, LS_USER_DATA } from "../../const";
import LogoutFlow from "../../flow/login/LogoutFlow";
import SearchMessageFlow from "../../flow/message/SearchMessageFlow";
import SearchPatientFlow from "../../flow/patients/SearchPatientFlow";
import { IChatMessage, StatusChatMessage, StatusChatMessageTranslate, TypeOfMessage } from "../../models/IChatMessage";
import { IMessageControl } from "../../models/IMessageControl";
import { IPatient } from "../../models/IPatient";
import { getDayPastAsText } from "../../utils";
import "./styles.css";

export const HomePage = () => {

  const [loadingMessages, setLoadingMessages] = useState<boolean>(false)
  const [loadingPatients, setLoadingPatients] = useState<boolean>(false)
  const [messageControlSelected, setMessageControlSelected] = useState<IMessageControl>()
  const [messageControls, setMessageControls] = useState<IMessageControl[]>([])
  const [consumer, setConsumer] = useState<Client>()
  const [inSecondPlan, setInSecondPlan] = useState<boolean>(false)
  const [_subscriptionsTopic, setSubscriptinsTopic] = useState<StompSubscription[]>([])

  const navigate = useNavigate()
  const [form] = Form.useForm()
  const refInputMessage = useRef(null);
  const contentRef = useRef(null);

  const userDataStr = localStorage.getItem(LS_USER_DATA);
  if (userDataStr === undefined || userDataStr === null) {
    throw Error("Invalid session")
  }
  const userData = JSON.parse(userDataStr);

  const logout = async () => {
    try {
      consumer?.deactivate()
      consumer?.forceDisconnect()
      await LogoutFlow.exec()
      navigate("/login")
    } catch (error: any) {
      notification.warning({
        message: "Falha ao realizar logout",
        description: error.message,
        duration: 5,
        placement: "topRight",
      })
    }
  }

  const loadPatients = async (): Promise<IPatient[]> => {
    setLoadingPatients(true)
    try {
      const response = await SearchPatientFlow.exec({})
      return response.data.items
    } catch (error: any) {
      notification.warning({
        message: "Falha ao carregar pacientes",
        description: error.message,
        duration: 5,
        placement: "topRight",
      })
    } finally {
      setLoadingPatients(false)
    }
    return Promise.reject()
  }

  const publishMessage = async (payload: IChatMessage) => {
    setMessageControls((prev: IMessageControl[]) => {

      const mc = prev.find((mc: IMessageControl) => mc.patient.user === messageControlSelected?.patient.user) as IMessageControl
      mc.messages = [payload, ...mc.messages];
      return [...prev]
    })

    if (consumer?.connected) {
      const destination = `/exchange/chat-message`;
      consumer.publish({
        destination: destination,
        body: JSON.stringify(payload),
      });
    }
  };

  const subscribing = async () => {
    setConsumer((prevConsumer: Client | undefined) => {
      setMessageControls((prevMC: IMessageControl[]) => {
        setSubscriptinsTopic((prevSubscriptions: StompSubscription[]) => {
          prevSubscriptions.forEach(sub => {
            console.log("unsubscribing: ", sub.id)
            sub.unsubscribe()
          });
          return prevSubscriptions
        })

        console.log("Subscribing topics")
        const newSubscribes: StompSubscription[] = []
        prevMC?.forEach((control: IMessageControl, indexMC: number) => {
          console.log("subscribing", `/topic/chat_user_rk_${control.patient.user}`)
          const sub = prevConsumer?.subscribe(`/topic/chat_user_rk_${control.patient.user}`, async (payload: IMessage) => {
            try {
              const message = JSON.parse(payload.body.toString()) as IChatMessage
              console.log(`R: /topic/chat_user_rk_${control.patient.user}`, message)
              setMessageControls((prevMessages: IMessageControl[]) => {
                const mc = prevMessages.find((mc: IMessageControl) => mc.patient.user === control.patient.user) as IMessageControl

                if (!mc) return prevMessages

                if (message.type === TypeOfMessage.CHAT_MESSAGE) {
                  const existingMessage = mc?.messages?.find((m: IChatMessage) => new Date(m.sendDateTime).getTime() === new Date(message.sendDateTime).getTime())

                  if (existingMessage) {
                    existingMessage._id = message._id
                    existingMessage.status = message.status
                  } else {
                    mc.messages = [message, ...mc.messages];
                    mc.amountNewMessages++
                    playNotificationSound(mc.patient.user)
                    if (message.author !== userData.user._id) {
                      if (prevConsumer?.connected) {
                        const payload: IChatMessage = {} as IChatMessage
                        payload._id = message._id
                        payload.sendDateTime = message.sendDateTime
                        setMessageControlSelected((mcs: IMessageControl | undefined) => {
                          payload.type = TypeOfMessage.RECEIVED
                          payload.receivedBy = userData.user._id
                          payload.receivedDateTime = new Date()
                          payload.account = userData.account
                          prevConsumer.publish({
                            destination: `/exchange/chat-message`,
                            body: JSON.stringify(payload),
                          });

                          setInSecondPlan((secondPlan: boolean) => {
                            if (mcs?.patient?.user === control.patient.user && !secondPlan) {
                              const payloadSeen = {
                                ...payload,
                                type: TypeOfMessage.SEEN,
                                seenBy: userData.user._id,
                                seenDateTime: new Date(),
                                receivedBy: undefined,
                                receivedDateTime: undefined,
                              } as unknown as IChatMessage

                              prevConsumer.publish({
                                destination: `/exchange/chat-message`,
                                body: JSON.stringify(payloadSeen),
                              });
                            }
                            return secondPlan
                          })
                          return mcs
                        })
                      }
                    }
                  }
                }

                if (message.type === TypeOfMessage.RECEIVED) {
                  const existingMessage = mc?.messages.find((m: IChatMessage) => new Date(m.sendDateTime).getTime() === new Date(message.sendDateTime).getTime())
                  if (existingMessage) {
                    if (!existingMessage.receivements?.length) {
                      existingMessage.receivements = []
                    }
                    existingMessage.receivements.push({
                      receivedBy: message.receivedBy,
                      receivedDateTime: new Date(message.receivedDateTime)
                    })
                    existingMessage.status = StatusChatMessage.RECEIVED
                  }
                }

                if (message.type === TypeOfMessage.SEEN) {
                  const existingMessage = mc?.messages.find((m: IChatMessage) => new Date(m.sendDateTime).getTime() === new Date(message.sendDateTime).getTime())
                  if (existingMessage) {
                    if (!existingMessage.seens?.length) {
                      existingMessage.seens = []
                    }
                    existingMessage.seens.push({
                      seenBy: message.seenBy,
                      seenDateTime: new Date(message.seenDateTime)
                    })
                    existingMessage.status = StatusChatMessage.SEEN
                  }
                }

                return [...prevMessages]
              });
              payload.ack()
            } catch (error) {
              payload.nack()
            }
          }, { ack: 'client' })
          newSubscribes.push(sub as StompSubscription)
          setMessageControls((prevMessages: IMessageControl[]) => {
            prevMessages[indexMC].subscribed = true
            return [...prevMessages]
          });
        })

        setSubscriptinsTopic([...newSubscribes])
        return prevMC
      })
      return prevConsumer
    })

  }

  const init = async () => {
    const chatDataStr = localStorage.getItem(LS_CHAT);
    let mc: IMessageControl[] = []
    if (chatDataStr) {
      const chatData = JSON.parse(chatDataStr) as IMessageControl[];
      mc = chatData.map((mc: IMessageControl) => { return { ...mc, subscribed: false } })
    } else {
      const patients = await loadPatients()
      for (const patient of patients) {
        const messageControl: IMessageControl = {} as IMessageControl
        messageControl.patient = patient
        messageControl.messages = []
        messageControl.subscribed = false
        messageControl.amountNewMessages = 0
        mc.push(messageControl)
      }
      localStorage.setItem(LS_CHAT, JSON.stringify(mc));
    }
    setMessageControls([...mc])
    connectBroker()
  }

  const connectBroker = () => {
    console.log("Criando conexão com broker...")
    if (consumer) {
      consumer.deactivate()
      consumer.forceDisconnect()
    }
    setConsumer((prev: Client | undefined) => {
      return new Client({
        brokerURL: import.meta.env.VITE_BROKER_URL,
        connectHeaders: {
          login: import.meta.env.VITE_BROKER_USER,
          passcode: import.meta.env.VITE_BROKER_PASSWORD,
        },
        reconnectDelay: 500,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('Connected - ', `${import.meta.env.VITE_BROKER_URL}`);
          subscribing()
        },
        onDisconnect: () => {
          console.log('Disconnected to RabbitMQ2 - ', `${import.meta.env.VITE_BROKER_URL}`);
        },
        onStompError: (frame: any) => {
          console.error('Broker reported error: ' + frame.headers['message']);
          console.error('Additional details: ' + frame.body);
        },
        onChangeState: (param: any) => {
          console.log('onChangeState: ', param);
        },
        onWebSocketError: (param: any) => {
          console.error('onWebSocketError: ', param);
        },
        onWebSocketClose: (param: any) => {
          console.log('onWebSocketClose: ', param);
          prev?.deactivate()
        },
        onUnhandledFrame: (param: any) => {
          console.log('onUnhandledFrame: ', param);
        },
        onUnhandledReceipt: (param: any) => {
          console.log('onUnhandledReceipt: ', param);
        },
        onUnhandledMessage: (param: any) => {
          console.log('onUnhandledMessage: ', param);
        },
      });
    })
  }

  const searchMessages = async () => {
    setLoadingMessages(true)
    try {
      const mc = messageControls.find((mc: IMessageControl) => mc.patient._id === messageControlSelected?.patient._id) as IMessageControl
      let lastSentDateTime = mc?.messages[mc?.messages.length - 1]?.sendDateTime ?? new Date()
      lastSentDateTime = moment(lastSentDateTime).subtract(1, "second").toDate()
      const response = await SearchMessageFlow.exec({
        routerKey: `rk_${messageControlSelected?.patient.user}`,
        sendDateTimeRange: [null, lastSentDateTime],
        orderSense: "desc",
        orderBy: "sendDateTime",
      })
      let oldMessages = response.data.items as IChatMessage[]
      if (oldMessages?.length) {
        setMessageControls((prevMessages: IMessageControl[]) => {
          const idsToRemove = new Set(mc?.messages.map((cm: IChatMessage) => cm._id));
          oldMessages = oldMessages.filter((om: IChatMessage) => !idsToRemove.has(om._id));
          mc.messages = [...mc.messages, ...oldMessages]

          return [...prevMessages]
        });
      }
    } catch (error: any) {
      notification.warning({
        message: "Falha ao carregar mensagem",
        description: error.message,
        duration: 5,
        placement: "topRight"
      })
    } finally {
      setLoadingMessages(false)
    }
  }

  const playNotificationSound = (userId: string) => {
    try {

      setInSecondPlan((currSP: boolean) => {
        if (currSP) {
          const audio = new Audio("/notification-sound.mp3");
          audio.play();
        } else {
          setMessageControlSelected((currMCS: IMessageControl | undefined) => {
            if (currMCS?.patient.user !== userId) {
              const audio = new Audio("/notification-sound.mp3");
              audio.play();
            }
            return currMCS
          })
        }
        return currSP
      })
    } catch (error) {
      console.error(error)
    }
  };

  useEffect(() => {
    init()
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setInSecondPlan(true)
      } else {
        setInSecondPlan(false)
      }
    };

    const handleBlur = () => {
      setInSecondPlan(true)
    };

    const handleFocus = () => {
      setInSecondPlan(false)
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [])

  useEffect(() => {
    if (consumer && !consumer?.active) {
      console.log("ativando conexao com broker")
      consumer?.activate()
    }
  }, [consumer])

  // MANTEM ARMAZENAMENTO LOCAL ATUALIZADO
  useEffect(() => {
    if (messageControls) {
      localStorage.setItem(LS_CHAT, JSON.stringify(messageControls));
    }
  }, [messageControls])

  // AO ALTERAR O CONTATO
  useEffect(() => {
    if (messageControlSelected) {
      setMessageControls((prevMessages: IMessageControl[]) => {
        const mc = prevMessages.find((mc: IMessageControl) => mc.patient._id === messageControlSelected.patient._id) as IMessageControl
        mc.amountNewMessages = 0
        return [...prevMessages]
      });


      const mc = messageControls.find((mc: IMessageControl) => mc.patient._id === messageControlSelected?.patient._id) as IMessageControl
      if (!mc.messages || mc.messages.length === 0) {
        searchMessages()
      }


      if (inSecondPlan === false) {
        if (messageControlSelected && consumer) {
          const messagesUnseens = messageControlSelected.messages.filter((cm: IChatMessage) => cm._id && cm.status !== StatusChatMessage.SEEN && cm.author !== userData.user._id)
          messagesUnseens.forEach((message: IChatMessage) => {
            const payload: IChatMessage = {} as IChatMessage
            payload._id = message._id
            payload.sendDateTime = message.sendDateTime

            payload.type = TypeOfMessage.SEEN
            payload.seenBy = userData.user._id
            payload.seenDateTime = new Date()

            consumer.publish({
              destination: `/exchange/chat-message`,
              body: JSON.stringify(payload),
            });
          })
        }
      }
    }
  }, [messageControlSelected])

  useEffect(() => {
    if (inSecondPlan === false) {
      if (messageControlSelected && consumer) {
        const messagesUnseens = messageControlSelected.messages.filter((cm: IChatMessage) => cm._id && cm.status !== StatusChatMessage.SEEN && cm.author !== userData.user._id)
        messagesUnseens.forEach((message: IChatMessage) => {
          const payload: IChatMessage = {} as IChatMessage
          payload._id = message._id
          payload.sendDateTime = message.sendDateTime

          payload.type = TypeOfMessage.SEEN
          payload.seenBy = userData.user._id
          payload.seenDateTime = new Date()

          consumer.publish({
            destination: `/exchange/chat-message`,
            body: JSON.stringify(payload),
          });
        })
      }
    }
  }, [inSecondPlan])

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ height: '8vh' }}>
        <Row justify="start">
          <Col span={12} style={{ textAlign: "start" }}>
            {userData.user.fullName}
          </Col>
          <Col span={12} style={{ textAlign: "end" }}>
            <Button onClick={logout} icon={<LogoutOutlined />}>Logout</Button>
          </Col>
        </Row>
      </Header>
      <Layout style={{ height: '90vh' }}>
        <Sider style={{
          background: "#ccc",
          textAlign: "center"
        }}>
          {!loadingPatients && (
            <Menu
              style={{
                background: "#ccc",
              }}
              mode="inline"
              theme="light"
              onSelect={(item: any) => {
                if (messageControlSelected) {
                  setMessageControls((prevMessages: IMessageControl[]) => {
                    const mc = prevMessages.find((mc: IMessageControl) => mc.patient._id === messageControlSelected.patient._id) as IMessageControl
                    mc.amountNewMessages = 0
                    return [...prevMessages]
                  });
                }
                setMessageControlSelected(messageControls.find((mc: IMessageControl) => mc.patient._id === item.key))
              }}
              items={messageControls.map((messageControl: IMessageControl) => {
                return {
                  key: messageControl.patient._id,
                  icon: <UserOutlined />,
                  label: <Badge count={messageControlSelected?.patient._id !== messageControl.patient._id ? messageControl.amountNewMessages ?? 0 : 0} offset={[12, 6]}>{messageControl.patient.fullName}</Badge>,
                  value: messageControl
                }
              })}
            />
          )}
          {loadingPatients && (<>Carregando clientes... <LoadingOutlined /></>)}
        </Sider>
        <Content>
          <Layout style={{
            height: "100%",
            display: "flex",
            flexDirection: "column"
          }}>
            {messageControlSelected && (
              <>
                <Content
                  ref={contentRef} style={{
                    alignContent: "flex-end",
                    overflowY: "auto",
                    flexDirection: "column-reverse",
                    display: "flex",
                  }}>
                  {messageControlSelected && messageControlSelected.messages.map((chatMessage: IChatMessage, index: number) => (
                    <div key={index}>
                      {/* label dias anteriores */}
                      <Row justify="center">
                        {messageControlSelected.messages[index + 1] && moment(chatMessage.sendDateTime).date() !== moment(messageControlSelected.messages[index + 1].sendDateTime).date() && (
                          <Col span={12}>
                            <Divider>{getDayPastAsText(moment(messageControlSelected.messages[index].sendDateTime))} <ArrowDownOutlined /></Divider>
                          </Col>
                        )}
                      </Row>
                      <Row justify="start" key={index} style={{ marginBottom: "4px" }}>
                        <Col span={12} offset={6} style={{ textAlign: userData.user._id === chatMessage.author ? "end" : "start" }}>
                          <Tag style={{ textWrap: "wrap", width: "auto", color: "black" }} color={userData.user._id === chatMessage.author ? "#d9fdd2" : "#fff"}>
                            <span><b>{userData.user._id === chatMessage.author ? "Você" : chatMessage?.authorName ?? "user"}: </b>{chatMessage.content}</span>
                            <br />
                            {userData.user._id === chatMessage.author && (
                              <>
                                <span style={{ color: "#ccc", textAlign: "end", fontStyle: "italic", display: "flex", float: "inline-end", gap: "4px" }}>
                                  {moment().date() - moment(chatMessage.sendDateTime).date() > 0 ? moment(chatMessage.sendDateTime).format("DD/MM/YYYY HH:mm") : moment(chatMessage.sendDateTime).format("HH:mm")}
                                  <Tooltip title={StatusChatMessageTranslate[chatMessage.status]}>
                                    {chatMessage.status === StatusChatMessage.NOT_SENT && <ClockCircleOutlined />}
                                    {chatMessage.status === StatusChatMessage.SENT && <CheckOutlined />}
                                    {chatMessage.status === StatusChatMessage.RECEIVED && <CheckCircleOutlined style={{ color: "skyblue" }} />}
                                    {chatMessage.status === StatusChatMessage.SEEN && <CheckCircleOutlined style={{ color: "green" }} />}
                                  </Tooltip>
                                </span>
                              </>
                            )}
                            {userData.user._id !== chatMessage.author && (
                              <span style={{ color: "#ccc", textAlign: "end", fontStyle: "italic", display: "flex", float: "inline-end", gap: "4px" }}>
                                {moment().date() - moment(chatMessage.sendDateTime).date() > 0 ? moment(chatMessage.sendDateTime).format("DD/MM/YYYY HH:mm") : moment(chatMessage.sendDateTime).format("HH:mm")}
                              </span>
                            )}
                          </Tag>
                        </Col>
                      </Row>

                    </div>
                  ))}

                  <Row justify="center">
                    <Col span={12} style={{ textAlign: "center" }}>
                      <Button loading={loadingMessages} onClick={() => {
                        searchMessages()
                      }}>{loadingMessages ? "Carregando..." : "Carregar anteriores"}</Button>
                    </Col>
                  </Row>
                </Content>
                <Footer style={{ flex: "0 0 auto", padding: 0 }}>
                  <Form form={form} layout="vertical"
                    onFinish={(v: any) => {
                      const payload = {
                        content: v.content,
                        author: userData.user._id,
                        authorName: userData.user.nickName,
                        status: StatusChatMessage.NOT_SENT,
                        sendDateTime: new Date(),
                        queue: messageControlSelected?.queue,
                        routerKey: `rk_${messageControlSelected?.patient.user}`,
                        type: TypeOfMessage.CHAT_MESSAGE
                      } as IChatMessage
                      publishMessage(payload);
                      const contentElement = contentRef.current;
                      if (contentElement) {
                        (contentElement as any).scrollTop = 0
                      }
                      form.resetFields()
                      if (refInputMessage?.current) {
                        (refInputMessage.current as any)?.blur();
                        setTimeout(() => {
                          (refInputMessage.current as any)?.focus();
                        }, 100);
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
                        form.submit();
                      }
                    }}>
                    <Row justify="center" style={{ gap: "8px", marginTop: "16px" }}>
                      <Col span={10}>
                        <Form.Item name="content" required rules={[{ required: true, message: "Mensagem vazia" }]}>
                          <TextArea placeholder="Digite sua mensagem e pressione Enter para enviar (Shift + Enter para quebra de linha)" ref={refInputMessage} rows={3} style={{ height: "80px", resize: "none" }} />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button icon={<SendOutlined />} htmlType="submit" style={{ height: "80px", width: "100%" }}>Enviar</Button>
                      </Col>
                    </Row>
                  </Form>
                </Footer>
              </>
            )}
          </Layout>
        </Content>
      </Layout >
    </Layout >
  )
}