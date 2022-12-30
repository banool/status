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
  useToast,
  Center,
  Card,
  CardHeader,
  Heading,
  CardBody,
  Stack,
  StackDivider,
  SimpleGrid,
  Spacer,
  Flex,
  Tooltip,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { useEffect } from "react";

type TimerInfo = {
  unitName: string;
  ExecMainStartTimestamp: number | undefined;
  ExecMainExitTimestamp: number | undefined;
  ExecMainStatus: number;
};

export const App = () => {
  const toast = useToast();

  const [timerInfo, updateTimerInfo] = React.useState<TimerInfo[]>([]);
  const [errorOccurred, updateErrorOccurred] = React.useState<boolean>(false);
  const [nextUpdateUnixtime, updateNextUpdateUnixtime] = React.useState<number>(
    Date.now() + 5000
  );
  const [ticker, updateTicker] = React.useState<number>(0);

  useEffect(() => {
    const updateTimerInfoWrapper = async () => {
      console.log("Fetching timer info");
      updateErrorOccurred(false);
      let response;
      try {
        response = await (
          await fetch("https://control.dport.me/timers")
        ).json();
      } catch (e) {
        console.log("Error fetching timer info");
        console.log(e);
        toast({
          title: "Error fetching timer info",
          description: `Error fetching timer info: ${e}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        updateErrorOccurred(true);
        return;
      }
      let newTimerInfo: TimerInfo[] = [];
      const keys = Object.keys(response);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        newTimerInfo.push({
          unitName: key,
          ExecMainStartTimestamp: response[key].ExecMainStartTimestamp,
          ExecMainExitTimestamp: response[key].ExecMainExitTimestamp,
          ExecMainStatus: response[key].ExecMainStatus,
        });
      }
      updateTimerInfo(newTimerInfo);
    };

    // Call it once on mount.
    updateTimerInfoWrapper();

    // Set a timer to keep calling it.
    setInterval(() => {
      updateNextUpdateUnixtime(Date.now() + 5000);
      updateTimerInfoWrapper();
    }, 5000);

    // Set another timer to cause the "seconds until" component to update every 200ms.
    setInterval(() => {
      updateTicker((ticker) => ticker + 1);
    }, 200);
  }, []);

  let timersComponent = <Text>Loading...</Text>;
  if (errorOccurred) {
    timersComponent = <Text>Error fetching timer info 😥</Text>;
  }
  if (timerInfo.length > 0) {
    timersComponent = (
      <SimpleGrid minChildWidth="320px" spacing={10} w="90vw">
        {timerInfo
          .sort((a, b) => a.unitName.localeCompare(b.unitName))
          .map((timer) => {
            const headerText =
              timer.ExecMainExitTimestamp !== undefined
                ? timer.ExecMainStatus === 0
                  ? "✅"
                  : "❌"
                : "⏳";
            const startedText =
              timer.ExecMainStartTimestamp !== undefined
                ? getDatetimePretty(timer.ExecMainStartTimestamp)
                : "Has not run yet...";
            let endedText;
            let durationText;
            if (timer.ExecMainStartTimestamp === undefined) {
              endedText = "N/A";
              durationText = "N/A";
            } else {
              endedText =
                timer.ExecMainExitTimestamp !== undefined
                  ? getDatetimePretty(timer.ExecMainExitTimestamp)
                  : "Running now...";
              if (timer.ExecMainExitTimestamp !== undefined) {
                durationText = getDurationPretty(
                  timer.ExecMainExitTimestamp - timer.ExecMainStartTimestamp
                );
              } else {
                durationText = `${getDurationPretty(
                  Math.round(Date.now() / 1000 - timer.ExecMainStartTimestamp)
                )} so far`;
              }
            }
            return (
              <Card key={timer.unitName}>
                <CardHeader>
                  <Flex>
                    <Heading size="md">
                      {getUnitNamePretty(timer.unitName).replace(
                        "Ddclient",
                        "ddclient"
                      )}
                    </Heading>
                    <Spacer />
                    <Tooltip label={`Exit code: ${timer.ExecMainStatus}`}>
                      <Text>{headerText}</Text>
                    </Tooltip>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <Stack divider={<StackDivider />} spacing="4">
                    <Box>
                      <Heading size="xs" textTransform="uppercase">
                        Last Run
                      </Heading>
                      <Text pt="2" fontSize="sm">
                        <strong>Started:</strong> {startedText}
                      </Text>
                      <Text pt="2" fontSize="sm">
                        <strong>Ended:</strong> {endedText}
                      </Text>
                      <Text pt="2" fontSize="sm">
                        <strong>Duration:</strong> {durationText}
                      </Text>
                    </Box>
                  </Stack>
                </CardBody>
              </Card>
            );
          })}
      </SimpleGrid>
    );
  }

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <ChakraProvider theme={theme}>
      <Box fontSize="xl">
        <Grid h="100vh" alignContent={"baseline"}>
          <ColorModeSwitcher justifySelf="flex-end" margin={3} />
          <Center>
            <VStack w="80vw" textAlign="center" spacing={8}>
              <Text fontSize="4xl">Status Page</Text>
              <Text fontSize="lg">
                Status page for my sites and projects, including{" "}
                <code>*.dport.me</code> and sites hosted elsewhere.
              </Text>
              <Link href={"https://stats.uptimerobot.com/pol1Gh9Wx4"}>
                <Button>Go to Uptime Robot Status Page</Button>
              </Link>
              <Divider w={"50vw"} />
              <Text fontSize="2xl">Timers</Text>
            </VStack>
          </Center>
          <Box padding={25}>
            <Text fontSize="lg" textAlign="center" key={ticker}>
              All timestamps relative to {tz}. Next update in{" "}
              {Math.floor((nextUpdateUnixtime - Date.now()) / 1000) + 1}{" "}
              seconds.
            </Text>
          </Box>
          <Center>{timersComponent}</Center>
          <Box h={25} />
        </Grid>
      </Box>
    </ChakraProvider>
  );
};

function getUnitNamePretty(unitName: string): string {
  return unitName
    .replace(/\.service$/, "")
    .replace(/-/g, " ")
    .replace(/\w\S*/g, function (txt: string) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function getDatetimePretty(unixtimeSecs: number) {
  var a = new Date(unixtimeSecs * 1000);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes() < 10 ? "0" + a.getMinutes() : a.getMinutes();
  var sec = a.getSeconds() < 10 ? "0" + a.getSeconds() : a.getSeconds();
  var time =
    date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec;
  return time;
}

// From https://stackoverflow.com/a/7579799.
function getDurationPretty(durationSecs: number) {
  var hours: any = Math.floor(durationSecs / 3600);
  var minutes: any = Math.floor((durationSecs - hours * 3600) / 60);
  var seconds: any = durationSecs - hours * 3600 - minutes * 60;
  var time = "";

  if (hours !== 0) {
    time = hours + " hours ";
  }
  if (minutes !== 0 || time !== "") {
    minutes = minutes < 10 && time !== "" ? "0" + minutes : String(minutes);
    time += minutes + " minutes ";
  }
  if (time === "") {
    time = seconds + " seconds";
  } else {
    time += seconds < 10 ? "0" + seconds : String(seconds) + " seconds";
  }
  return time;
}
