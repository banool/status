import * as React from "react";
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Grid,
  theme,
  Divider,
  Button,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid h="100vh" alignContent={"baseline"}>
          <ColorModeSwitcher justifySelf="flex-end" />
          <VStack spacing={8}>
            <Text fontSize="4xl">Status Page</Text>
            <Text>
              Status page for my sites and projects, including{" "}
              <code>*.dport.me</code> and sites hosted elsewhere.
            </Text>
            <Divider w={"75vw"} />
            <Link href={"https://stats.uptimerobot.com/pol1Gh9Wx4"} download>
              <Button>Go to Uptime Robot Status Page</Button>
            </Link>
            <Divider w={"50vw"} />
            <Text fontSize="3xl">Timers</Text>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
};
