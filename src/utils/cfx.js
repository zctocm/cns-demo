import { Conflux } from "js-conflux-sdk/dist/js-conflux-sdk.umd.min.js";
import {default as Web3Domain} from '@web3identity/web3ns/dist/Web3';
import controllerData from "../contracts/ETHRegistrarController.json"
import nameWrapperData from "../contracts/NameWrapper.json"
import reverseRegistrarData from "../contracts/ReverseRegistrar.json"
import baseRegistrarData from "../contracts/BaseRegistrar.json"
import publicResolverData from "../contracts/PublicResolver.json"
console.info('Web3Domain1',Web3Domain)
const cfxClient = new Conflux({
  // url: "https://test.confluxrpc.com",
  networkId: 1,
});
cfxClient.provider = window.conflux;
// update sdk network id when chain changed
window.conflux.on('chainChanged', cfxClient.updateNetworkId);
const controller_address = "cfxtest:acc44su6m7sm6mksmdbvcnh9rp6ukj2yva7ee43nzy";
const name_wrapper_address='cfxtest:acgmx74wb372f3azk2g8f7324fvc5mkprjftx7eb4a'
const reverse_registrar_address='cfxtest:acbbvt09yr3z6fvkp3p92fk81e1ustw226n5vr4thh'
const base_registrar_address='cfxtest:acaur7c1r24cnyjb6jkxg6a17kzapzvhtjv4py4nvr'
export const public_resolver_address='cfxtest:acecxexm0pg268m44jncw5bmagwwmun53jj9msmadj'

export const controllerAddressContract = cfxClient.Contract({
  abi: controllerData.abi,
  bytecode: controllerData.bytecode,
  address: controller_address,
});
export const nameWrapperContract = cfxClient.Contract({
  abi: nameWrapperData.abi,
  bytecode: nameWrapperData.bytecode,
  address: name_wrapper_address,
});

export const reverseRegistrarContract = cfxClient.Contract({
  abi: reverseRegistrarData.abi,
  bytecode: reverseRegistrarData.bytecode,
  address: reverse_registrar_address,
});

export const baseRegistrarContract = cfxClient.Contract({
  abi: baseRegistrarData.abi,
  bytecode: baseRegistrarData.bytecode,
  address: base_registrar_address,
});

export const publicResolverContract = cfxClient.Contract({
  abi: publicResolverData.abi,
  bytecode: publicResolverData.bytecode,
  address: public_resolver_address,
});



export const web3domain = new Web3Domain({
  client: cfxClient,
  registryAddress:'cfxtest:achg113s8916v2u756tvf6hdvmbsb73b16ykt1pvwm',
  reverseRegistrarAddress:'cfxtest:ach1p03gkptxz07p4ecn66gjpd0xrnkkbj1n6p96d5',
  baseRegistrarAddress:'cfxtest:acc1ttg7287cybsdy6bn0002nzepypn29yavjbj36g',
  web3ControllerAddress:'cfxtest:acbrnwph2609zbf21np0501d87xb9dnvuakpv911xk',
  nameWrapperAddress:'cfxtest:acdc4xzy0pg1dzrbajgmv8nw3cjyj6ezn2dzncc4w5',
  publicResolverAddress:'cfxtest:acecxexm0pg268m44jncw5bmagwwmun53jj9msmadj'
});