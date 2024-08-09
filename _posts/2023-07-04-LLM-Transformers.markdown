---
layout: postv2
font: serif
title: "LLM Transformers"
description: "Empower LLM models with Transformers and Agents"
date: 2023-07-04
author: Nadia Reyhani
tags: [Machine Learning, OpenAI, StarCoder, OpenAssistant, Transformers, Agents]
---

## Natural Language Processing and Transformers

<div style="width:100%;height:0;padding-bottom:56%;position:relative;margin-bottom:10%"><iframe src="https://giphy.com/embed/2y1Ns6zIfK6WI8d21y" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div>

In a recent experiment, I explored Hugging Face and OpenAI Transformers, and in this blog post, I will guide you through some easy steps to generate your first Hugging Face Transformer. But before we dive into the code snippets and their explanations, let's go over some important terms and concepts in Machine Learning.

### Natural Language Processing (NLP)

Natural Language Processing (NLP) is a branch of artificial intelligence that focuses on enabling computers to understand and work with human language. It involves teaching machines to interpret and analyze written or spoken text, allowing them to extract meaning, respond appropriately, and perform tasks like language translation, sentiment analysis, and text summarization. NLP aims to bridge the gap between human language and computer understanding, making it easier for people and machines to communicate effectively.

### Large Language Models (LLM)

LLM or Large Language Models are advanced Machine Learning Models that has been trained on massive datasets to understand the complexities of language and the relationships between words. LLM models represent a significant advancement in the field of artificial intelligence, bringing us closer to machines that can understand and interact with language in a more human-like manner.
Why do we call them LLM? The term "Large Language Models" is used to emphasize the magnitude and capabilities of these models in handling diverse language-related tasks.

### Transformers

Transformers are a type of architecture used in deep learning models for natural language processing tasks.
They have revolutionized the field of natural language processing by enabling more accurate and context-aware language understanding and generation. Transformers are designed to understand the relationships between words in a sentence by considering the entire context. This has greatly enhanced the performance of language-related applications, resulting in significant advancements in AI.

### Agents

Transformer Agents are smart software entities that use transformer-based models to interact with users. These agents understand user inputs, context, and generate natural language responses. By leveraging transformers, which excel at understanding word relationships, these agents enable human-like conversations. They are employed in applications like virtual assistants and chatbots, enhancing user experiences and facilitating efficient communication between humans and machines.

### Prompt Engineering

Prompt refers to instructions given to language models to elicit desired responses. Prompt Engineering on the other hand, involves carefully crafting input text to guide the model's generation process and shape its output. It is a technique used to enhance the performance and control the output of language models, enabling users to obtain more accurate and tailored responses for their specific needs.

### Hugging Face, Open AI

Hugging Face provides open-source tools including pre-trained models, datasets, and software libraries that make it easier to work with and deploy state-of-the-art NLP models.

OpenAI on the other hand focuses on artificial intelligence (AI) and machine learning. They are known for their advancements in developing large-scale language models like GPT.

---

## Transformers and agents in action

In the field of natural language processing and text analysis, creating effective summarization models has been a major focus. Summarization involves condensing text while preserving its main meaning, making it easier to extract important information without reading the whole document. As an exercise we are going to develope our own summarization transformer, a powerful tool that showcases the power of Transformers' custom tools in this area.

To create our Summarizer Agent, the initial step is to set up and initialize the agent. Depending on whether you prefer using pre-trained models from Hugging Face or OpenAI, I have developed a helper function that can facilitate different setups.

## Set Up the Agent

```py

#param ["StarCoder (HF Token)", "OpenAssistant (HF Token)", "OpenAI (API Key)"]
from huggingface_hub import login
from transformers.tools import OpenAiAgent
from transformers.tools import HfAgent

token = "ADD_YOUR_HF_TOKEN"
login(token)

def set_up_agent(agent_name, tools):
  if agent_name == "StarCoder (HF Token)":
      return HfAgent("https://api-inference.huggingface.co/models/bigcode/starcoder", additional_tools=tools)
  elif agent_name == "OpenAssistant (HF Token)":
      return HfAgent(url_endpoint="https://api-inference.huggingface.co/models/OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5", additional_tools=tools)
  if agent_name == "OpenAI (API Key)":
      pswd = getpass.getpass('OpenAI API key:')
      return OpenAiAgent(model="text-davinci-003", api_key=pswd)

agent = set_up_agent("StarCoder (HF Token)",[])
```

## Manage the Agent's Toolbox

Up to this point, we have successfully developed an agent that enables users to interact with it and request document summarization. Transformer agents come equipped with a default set of tools, called PreTools, which enhance their functionality. To get a list of all available PreTools you can simply run this command:

```py

# The command bellow will print a list of PreTools on the agent
print(agent.toolbox)
## Output: one of the default PreTools in Agent's Toolbox
{"document_qa": PreTool(task='document-question-answering', description='This is a tool that answers a question about an document (pdf). It takes an input named `document` which should be the document containing the information, as well as a `question` that is the question about the document. It returns a text that contains the answer to the question.', repo_id=None)}

```

To minimize confusion for your Transformer agent, it is recommended to remove any unused tools from its toolbox.
Removing the PreTools from an agent's toolbox can be advantageous in certain scenarios. Here are a few reasons:

- Customization: By removing the PreTools, you have the flexibility to tailor the agent's behavior and capabilities according to your specific needs. In our instance, We are creating a custom summarisation Tool. The Hugging Face already has a summariser tool. by removing that, we can customise the Agent with our summariser.

- Resource optimization: PreTools may include additional functionalities that might not be relevant or necessary for your particular use case.By removing them, you can optimize the performance by potentially reducing memory usage and improving efficiency of the Agent.

- Specialized requirements: Depending on the application, you might require different tools that are not covered by the default PreTools. Removing them allows you to replace them with more suitable tools that align with your specific requirements

Let's do some clean up on the default PreTools. By running the code snippet bellow, no tools will remain in the Agent ToolBox, hence we have not added the additional Tools into the agent toolbox yet.

```py
# Remove unused Tools from your agent toolbox
def delete_unused_tools(agent):
    del_list = []

    for name, tool in agent.toolbox.items():
        if type(tool) is PreTool:
            del_list.append(name)

    # pop the tools identified
    for name in del_list:
        del agent.toolbox[name]

# List all available tools within your Agent's toolbox
def view_available_tools(agent):
    for i, (name, tool) in enumerate(agent.toolbox.items()):
        if type(tool) is PreTool:
            print(f"{i+1}: {name} (PreTool)")
        else:
            print(f"{i+1}: {name} (Tool)")

```

## Create Custom Tool

To define a custom tool in Transformers, you can create a Python function or class that performs the desired processing or functionality. We will begin by creating a function for summarization, utilizing the pretrained model named "facebook/bart-large-cnn".

```py


# Function to remove noise from the summary such as page number or references.
def remove_noise(summary):
    # Define patterns for noise removal
    patterns = [
        r"\bPage \d+\b",  # Remove page numbers
        r"\bReferences:\b",  # Remove references section
        # Add more patterns as per your specific requirements
    ]
    # Apply pattern matching to remove noise
    for pattern in patterns:
        summary = re.sub(pattern, "", summary)
    return summary.strip()

## Custom tool for Summarisation of long Documents
def summarize_document(file_content):
    tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
    model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn")
    summarizer = pipeline("summarization", model=model, tokenizer=tokenizer)

# Split the document into sentences, to get more meaningful summary without truncated sentences.
    sentences = file_content.split(".")
    chunk_size = 512  # Adjust the chunk size as needed
    chunks = []
    chunk = ""
    for sentence in sentences:
        if len(chunk) + len(sentence) < chunk_size:
            chunk += sentence + "."
        else:
            chunks.append(chunk.strip())
            chunk = sentence + "."
    if chunk:
        chunks.append(chunk.strip())

    # Generate summaries for each chunk
    summaries = []
    for chunk in chunks:
        summary = summarizer(chunk, max_length=300, min_length=40, do_sample=False)[0]['summary_text']
        summaries.append(summary)

    # Concatenate the summaries into a single summary
    final_summary = ' '.join(summaries)
    final_summary = remove_noise(final_summary)
    return final_summary

```

As you may have noticed, the previous code snippet utilized the `Pipeline` feature from the Transformers library. Transformers pipelines are a high-level, easy-to-use API provided by the library. They allow you to perform various natural language processing tasks, such as text classification, named entity recognition, question answering, and summarization, using pretrained models without requiring extensive code implementation. By specifying the model name ("facebook/bart-large-cnn"), the pipeline was configured to perform document summarization using the pretrained BART model.

```py

class summarize_service (Tool):
    """
        Custom Tool: CustomTool

        Description:
        A custom tool that performs custom preprocessing, tokenization,
        and postprocessing using a Transformer tokenizer and model.

        Input:
        - input_text (str): The input text to be processed.

        Output:
        - processed_output (Any): The processed output based on custom logic.
    """
    name="file_summarization_tool"
    description="This is a tool for summarizing content of the documents. It takes an input named `file_content`. and returns the summarization of the content as text."
    input=['text']
    output=['text']

    def __init__(self, param1, param2):
        self.param1 = param1
        self.param2 = param2

    # Perform custom preprocessing or manipulation on input_text
    # Implement your custom logic here
    # Each Time you ask agent for summarisation task, this is how it calls the logic to summarise the doc.
    def __call__(self, file_content: str):
        return summarize_document(file_content)

file_summarization_tool =  summarize_service()
```

### Introduce the Additional Tools To the Agent

By adding the custom tool to the agent's toolbox, you can integrate it seamlessly into the agent's functionality and leverage its custom preprocessing and processing capabilities.

```py
import bertSummarizer_tool as summarizer

tools = [
  .
  .
  .
    summarizer.file_summarization_tool,
]

agent = set_up_agent("StarCoder (HF Token)", additional_tools=tools)

# List all the current tools on our agent:
print(agent.toolbox)
# result will be like:
# { .
#   .
#   .
#   'file_summarization_tool': <bertSummarizer_tool.summarize_service object at 0x167c0d550>,
#   }

```

### Get Inference from Agent

To ask Agent to summarise the document for you, you can simply call this function:

```py
def summarize(document):
    return agent.run(f"Summarize content of the documents {document}.", document = document )

```

As Simple as that we created an LLM agent that can summarise the document for us. But you might ask why do we even need a custom tools in transformers? Custom Tools in Transformers can be beneficial for several reasons:

- Specific Use Cases: Transformers is a versatile library that provides a wide range of tools and functionalities. However, some use cases may require specific preprocessing, postprocessing, or intermediate steps that are not covered by the built-in tools. Custom tools allow you to address these unique requirements and tailor the behavior of the models to your specific needs.

- Domain-Specific Processing: In certain scenarios, there may be domain-specific data or text characteristics that require specialized processing. Custom tools enable you to incorporate domain-specific knowledge or techniques into the pipeline, enhancing the performance and accuracy of the models in those specific domains.

- Performance Optimization: Depending on your application's constraints, you may need to optimize the performance of the models by fine-tuning or modifying the existing tools. Custom tools give you the flexibility to optimize the process, potentially improving speed, memory usage, or overall efficiency.

- Integration with Existing Workflows: Custom tools allow seamless integration of the Transformers library with existing data processing workflows or frameworks. This enables you to leverage the power of Transformers while maintaining compatibility and consistency with your existing codebase.

Overall, custom tools in Transformers provide flexibility, control, and customization options to accommodate specific requirements, domain expertise, and performance optimization. They empower developers to fine-tune the library's functionality and achieve better results in various NLP applications.

I hope this guide has provided you with a solid foundation to get started with building your own custom Transformer tools. If you have any further questions or need assistance, please feel free to reach out to [contact us](https://mechanicalrock.io/lets-get-started). Our team is dedicated to providing unwavering support and guidance whenever you need it.

Good luck with your LLM endeavors!
