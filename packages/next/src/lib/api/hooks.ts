import { useQuery } from "@tanstack/react-query";
import { request, gql } from "graphql-request";
import { Erc20Owner, Erc721Token } from "../types";
import { checksumAddress } from "viem";

// const URL = "/api/ponder";
const URL = "http://localhost:42069";

export const getErc20Owners = async (
  chainId: number,
  contractAddress: `0x${string}`
) => {
  const data = (await request(
    URL,
    gql`
        {
          erc20Owners(where: {chainId: ${chainId}, contractAddress: \"${checksumAddress(
      contractAddress ?? "0x"
    )}\", balance_not: \"0\"}) {
            items {
              id
              ownerAddress
              balance
            }
          }
        }
      `
  )) as { erc20Owners: { items: any[] } };
  return (data?.erc20Owners?.items ?? []) as Erc20Owner[];
};
export function useErc20Owners(
  chainId?: number,
  contractAddress?: `0x${string}`
) {
  return useQuery({
    queryKey: ["erc20Owners"],
    queryFn: async () => {
      return await getErc20Owners(chainId!, contractAddress!);
    },
    enabled: Boolean(chainId && contractAddress),
  });
}

export const getErc721Tokens = async (
  chainId: number,
  contractAddress: `0x${string}`
) => {
  const data = (await request(
    URL,
    gql`
        {
          erc721Tokens(where: {chainId: ${chainId}, contractAddress: \"${checksumAddress(
      contractAddress ?? "0x"
    )}\"}) {
            items {
              id
              tokenId
              ownerAddress
              mintedAt
              tbaAddress
            }
          }
        }
      `
  )) as { erc721Tokens: { items: any[] } };
  return (data?.erc721Tokens?.items ?? []).map((v) => ({
    ...v,
    mintedAt: new Date(parseInt(v.mintedAt) * 1000),
  })) as Erc721Token[];
};

export function useErc721Tokens(
  chainId?: number,
  contractAddress?: `0x${string}`
) {
  return useQuery({
    queryKey: ["erc721Tokens"],
    queryFn: async () => await getErc721Tokens(chainId!, contractAddress!),
    enabled: Boolean(chainId && contractAddress),
  });
}
