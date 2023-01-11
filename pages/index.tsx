import Head from "next/head";
import {
  Box,
  Divider,
  Grid,
  Heading,
  Text,
  Stack,
  Container,
  Link,
  Button as ButtonChakra,
  Flex,
  Icon,
  useColorMode,
} from "@chakra-ui/react";
import { BsFillMoonStarsFill, BsFillSunFill } from "react-icons/bs";

import { useChain, useWallet } from "@cosmos-kit/react";
import { WalletStatus } from "@cosmos-kit/core";

import {
  chainName,
  coin,
  cw20ContractAddress,
  dependencies,
  products,
} from "../config";
import {
  Product,
  Dependency,
  WalletSection,
  handleChangeColorModeValue,
  HackCw20,
} from "../components";
import { useHackCw20Balance } from "../hooks/use-hack-cw20-balance";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Form,
  Input,
  Layout,
  Menu,
  message,
  Row,
  theme,
} from "antd";
import { StdFee } from "@cosmjs/stargate";
import { useEffect, useState } from "react";
import { MsgExecuteContract } from "interchain/types/codegen/cosmwasm/wasm/v1/tx";
import { send } from "process";
import { Content, Footer, Header } from "antd/es/layout/layout";
import BigNumber from "bignumber.js";
const library = {
  title: "Telescope",
  text: "telescope",
  href: "https://github.com/cosmology-tech/interchain",
};

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { walletStatus } = useWallet();
  const { balance } = useHackCw20Balance(cw20ContractAddress);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Container maxW="5xl" py={10}>
      <WalletSection />

      <Box w="full" maxW="md" mx="auto">
        <HackCw20
          balance={balance}
          isConnectWallet={walletStatus !== WalletStatus.Disconnected}
        />
      </Box>

      {walletStatus !== WalletStatus.Disconnected ? (
        <div className="site-card-wrapper" style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Card title="Mint">
                <MintForm></MintForm>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Burn">
                <BurnForm></BurnForm>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Transfer">
                <TransferForm></TransferForm>
              </Card>
            </Col>
          </Row>
        </div>
      ) : (
        <></>
      )}
    </Container>
  );
}

const MintForm = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { getSigningCosmWasmClient, address, getRpcEndpoint } = useWallet();

  const onFinish = async (values: any) => {
    console.log(values);
    await mintToken(
      form.getFieldValue("recipient"),
      form.getFieldValue("amount")
    );
  };

  const mintToken = async (recipient: string, amount: string) => {
    setLoading((loading) => !loading);

    const cosmwasmClient = await getSigningCosmWasmClient();

    const fee: StdFee = {
      amount: [
        {
          denom: coin.base,
          amount: "200000",
        },
      ],
      gas: "200000",
    };

    const msg = {
      mint: { recipient: recipient, amount: amount },
    };

    try {
      const response = await cosmwasmClient?.execute(
        address!,
        cw20ContractAddress,
        msg,
        fee
      );

      setLoading((loading) => !loading);
      messageApi.success({
        content: "Minted success!",
      });

      // setResp(JSON.stringify(response, null, 2));
    } catch (error) {
      setLoading((loading) => !loading);
      messageApi.error({
        content: `Error! ${(error as Error).message}`,
      });
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      {contextHolder}
      <Form
        layout={"vertical"}
        form={form}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Recipient"
          name="recipient"
          rules={[{ required: true, message: "Please input Recipient!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: "Please input Amount!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Mint
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

const BurnForm = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { getSigningCosmWasmClient, address } = useWallet();
  const [ balanceAddress, setBalance] = useState("0");
  const { balance } = useHackCw20Balance(cw20ContractAddress);
  useEffect(() => {
    setBalance(balance!);
  }, [balance]);

  const onFinish = async (values: any) => {
    await burnToken(form.getFieldValue("amount"));
  };

  const burnToken = async (amount: string) => {
    setLoading((loading) => !loading);

    const cosmwasmClient = await getSigningCosmWasmClient();

    const fee: StdFee = {
      amount: [
        {
          denom: coin.base,
          amount: "200000",
        },
      ],
      gas: "200000",
    };

    const msg = {
      burn: { amount: amount },
    };

    try {
      const response = await cosmwasmClient?.execute(
        address!,
        cw20ContractAddress,
        msg,
        fee
      );

      setLoading((loading) => !loading);
      setBalance((parseInt(balance!) - parseInt(amount)).toString()) ;
      messageApi.success({
        content: "Burn success!",
      });

      // setResp(JSON.stringify(response, null, 2));
    } catch (error) {
      setLoading((loading) => !loading);
      messageApi.error({
        content: `Error! ${(error as Error).message}`,
      });
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      {contextHolder}
      <Form
        layout={"vertical"}
        form={form}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item label="Address" name="address">
          <span style={{ fontWeight: "bold" }}>{address}</span>
        </Form.Item>

        <Form.Item label="Balance">
          <span style={{ fontWeight: "bold" }}>{ balanceAddress }</span>
        </Form.Item>

        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: "Please input Amount!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Burn
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

const TransferForm = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { getSigningCosmWasmClient, address } = useWallet();
  const [ balanceAddress, setBalance] = useState("0");
  const { balance } = useHackCw20Balance(cw20ContractAddress);

  useEffect(() => {
    setBalance(balance!);
  }, [balance]);

  const onFinish = async (values: any) => {
    await doTransfer(
      form.getFieldValue("toAddress"),
      form.getFieldValue("amount")
    );
  };

  const doTransfer = async (recipient: string, amount: string) => {
    setLoading((loading) => !loading);

    const cosmwasmClient = await getSigningCosmWasmClient();

    const fee: StdFee = {
      amount: [
        {
          denom: coin.base,
          amount: "200000",
        },
      ],
      gas: "200000",
    };

    const msg = {
      transfer: { recipient: recipient, amount: amount },
    };

    try {
      const response = await cosmwasmClient?.execute(
        address!,
        cw20ContractAddress,
        msg,
        fee
      );

      setLoading((loading) => !loading);
      setBalance((parseInt(balance!) - parseInt(amount)).toString()) ;
      messageApi.success({
        content: "Transfered success!",
      });

      // setResp(JSON.stringify(response, null, 2));
    } catch (error) {
      setLoading((loading) => !loading);
      messageApi.error({
        content: `Error! ${(error as Error).message}`,
      });
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      {contextHolder}
      <Form
        layout={"vertical"}
        form={form}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item label="From" name="fromAddress">
          <span style={{ fontWeight: "bold" }}>{address}</span>
        </Form.Item>

        <Form.Item label="Balance">
          <span style={{ fontWeight: "bold" }}>{ balanceAddress }</span>
        </Form.Item>

        <Form.Item
          label="To"
          name="toAddress"
          rules={[{ required: true, message: "Please input address!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: "Please input Amount!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Send
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};
